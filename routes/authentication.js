'use strict';
var app = require('express')();
var passport = require('passport');

app.post('/login', function(req, res, next) {
  var user = req.body;
  if(!user.username || !user.password) {
    return res.json({message: 'Usuario o contraseña incorrecto'});
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);

    if (!user) { return res.json(info); }

    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.json(user);
    });
  })(req, res, next);

});

app.get('/logout', function(req, res){
  req.logout();
  req.session.destroy();
  res.redirect('/#login');
});

module.exports = app;
