'use strict';
var app = require('express')();
var authentication = require('./authentication');
var users = require('./users');
var photos = require('./photos');
var photoTagged = require('./photo_tagged');
var photoComments = require('./photo_comments');
var photoLikes = require('./photo_likes');
var hashtags = require('./hashtags');
var activities = require('./activities');

app.get('/', function(req, res) {
  return res.sendFile(__base + '/views/index.html');
});

app.get('/guia', function(req, res) {
  return res.sendFile(__base + '/views/guide.html');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.use(authentication);
app.use(users);
app.use(photos);
app.use(photoTagged);
app.use(photoComments);
app.use(photoLikes);
app.use(hashtags);
app.use(activities);

module.exports = app;
