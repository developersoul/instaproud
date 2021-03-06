'use strict';
var app = require('express')();
var bcrypt = require('bcrypt');
var _ = require('underscore');
var base = __base;
var User = require(base + 'models/user');
var Photo = require(base + 'models/photo');
var photosByOwner = require(base + 'lib/photos/by_owner');
var photosByTagged = require(base + 'lib/photos/by_tagged');
var generateHash = require(base + 'lib/createName');
var photosCount = require(base + 'lib/photos/count_by_owner');
var processProfileImage = require(base + 'lib/users/process_profile_image');
var addProfileImage = require(base + 'lib/users/add_profile_image');
var uploadToS3 = require(base + 'lib/photos/upload_to_S3');
var mailVerification = require(base + 'mails/verification');
var mailRecover = require(base + 'mails/recover');

app.post('/users', function(req, res, next) {
  var data = req.body;
  var newUser = new User(data);

  newUser.save(function(err, user) {
    if(err && err.code === 11000) return res.status(400).json({message: 'el usuario ya existe'});
    if (err) return res.status(400).json(err.errors);

    req.login(user, function(err) {
      if (err) return next(err);
      mailVerification(user, function(err, status) {
        if(err) return console.log(err);
        return res.status(201).json(user);
      });
    });
  });
});

app.post('/user/recover/:id', function(req, res) {
  var body = req.body;
  var id = req.params.id;
  var salt = req.query.code;

  User.findOne({_id: id, salt: salt}, function(err, user) {
    if(err) return res.status(400).json({message: 'no existe'});
    if(!user) return res.status(400).json({message: 'no existe'});

      user.password = body.password;
      user.save(function(err) {
        if(err) return res.status(400).json(err.errors.password);
        return res.json({status: 'ok'});
      });
  });
});

app.post('/users/recoverpassword/:username', function(req, res) {
  var username = req.params.username;
  User.findOne({username: username}).exec(function(err, user) {
    if(err) return res.status(400).json({message: 'error'});
    if(!user) return res.status(400).json({message: 'error'});
    mailRecover(user, function() {
      return res.json({status: 'ok'});
    });
  });
});

app.get('/users/:id/validation/', function(req, res) {
  var id = req.params.id;
  var salt = req.query.code;
  User
  .findOne({_id: id, salt: salt})
  .exec(function(err, user) {
    if(err) return res.status(400).json(err);
    if (user) {
      bcrypt.genSalt(10, function(err, salt) {
        if(err) return err;
        bcrypt.hash('Inst4BvC', salt, function(err, hash) {
            User
            .update({_id: id}, {$set: {status: 'active', salt: hash}})
            .exec(function(err) {
            if(err) return res.status(400).json(err);
            return res.sendfile('./views/activated.html');
          });
        });
      });
    } else {
      return res.status(400).json('error');
    }
  });
});

app.get('/users/:id/recover', function(req, res) {
  var id = req.params.id;
  var salt = req.query.code;

  User
    .findOne({_id: id, salt: salt})
    .exec(function(err, user) {
      if(err) return res.status(400).json(err);
      return res.sendfile('./views/recover.html');
    });
});

app.get('/api/users/:username/profile', function(req, res) {
  var username = req.params.username;
  var data = {};

  User.findOne({username: username})
  .exec(function(err, user) {
    if (err) return res.status(400).json({message: 'No existe'});
    photosCount(user.id, function(err, count) {
      if (err) return res.status(400).json({message: err});
      data = {user: user, photosCount: count};
      return res.json(data);
    });
  });
});

app.route('/api/users/:id')
  .get(function(req, res) {
    User.findById(req.params.id, 'username name email profile_image role birthday gender area bio', function(err, user) {
      if(err) res.status(400).json(err);
      res.json(user);
    });
  })
  .put(function(req, res) {
    var data = req.body;
    var id = req.params.id;

    User.update({_id: id}, data, { runValidators: true }, function(err, user) {
      if(err) return res.status(400).json(err);

      User.findOne({_id: id}, function(err, userUpadated){
        if (err) return next(err);
        return res.json(userUpadated);
      });

    });
  });

app.post('/users/:id/image', function(req, res, next) {
  var userId = req.user._id;
  var image = req.files.profile_image.path;
  var time = Date.now();
  var name;
  var folder;
  var path;

  generateHash(userId, function(err, hash) {
    if (err) return next(err);

    name = hash + '_' + time + '_profile.jpeg';
    folder = './public/images/' + userId;
    path = folder + '/' + name;

    //processImage
    processProfileImage(image, folder, path, function(err) {
      if (err) return next(err);

      //add Profile image
      addProfileImage(userId, name, function(err, user) {
        if (err) return next(err);

        //find one
        User.findOne({_id: user.id}, function(err, userUpadated) {
          if (err) return next(err);

          //upload to s3
          uploadToS3(name, req.user._id, function(err, data) {
            if (err) return next(err);

            return res.json(userUpadated);
          });
        });
      });
    });
  });
});

app.get('/users/search/:query', function(req, res) {
  var query = req.params.query;

  User.find({$or: [
    {name: new RegExp(query, 'i')},
    {username: new RegExp(query, 'i')}
  ]}, 'name username profile_image')
  .exec(function(err, users) {
    if (err) throw err;
    return res.json(users);
  });
});

app.get('/api/users/:username/photos', function(req, res, next) {
  var username = req.params.username;
  var photosSkip = parseInt(req.query.photosSkip);

  User.findOne({username: username})
  .exec(function(err, user) {
    if (err) return res.status(400).json({message: 'No existe'});

    photosByOwner(user, photosSkip, function(err, data) {
      if (err) return next(err);
      return res.json(data);
    });

  });
});

app.get('/api/users/:username/tagged', function(req, res, next) {
  var username = req.params.username;
  var photosSkip = parseInt(req.query.photosSkip) || 0;
  var data;

  User.findOne({username: username}, function(err, user) {
    if (err) return res.status(400).json({message: 'No existe'});

    photosByTagged(user, photosSkip, function(err, data) {
      if (err) return next(err);
      return res.json(data.photos);
    });
  });

});

app.get('/api/users/me/logged', function(req, res){
  Photo
  .find()
  .exec(function(err, photos) {
    return res.json(_.countBy(photos, 'owner'));
  });
});

app.post('/api/users/:id/password', function(req, res) {
  var body = req.body;
  var id = req.params.id;

  if (body.password === '') {
    return res.status(400).json({message: 'debe ingresar la contraseña actual'});
  }

  if (body.newPassword === '') {
    return res.status(400).json({message: 'debe ingresar una nueva contraseña'});
  }

  if (body.rePassword === '') {
    return res.status(400).json({message: 'debe verificar la contraseña'});
  }

  if (body.newPassword !== body.rePassword) {
    return res.status(400).json({message: 'no coincide'});
  }

  User.findOne({_id: id}, function(err, user) {
    if(err) res.status(400).json({message: 'no existe'});
    if(user.validPassword(body.password)) {
      user.password = body.newPassword;
      user.save(function(err) {
        if(err) return res.status(400).json(err.errors.password);
        return res.json({status: 'ok'});
      });
    } else {
        return res.status(400).json({message: 'contraseña actual no valida'});
    }
  });
});


module.exports = app;
