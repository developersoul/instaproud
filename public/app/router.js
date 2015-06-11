//Dependencies
var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

//Utils
var pubsub = require('utils/pubsub');
var checkUser = require('utils/check_user');

//Controllers
var AppController = require('controllers/app');
var photosController = require('controllers/photos');
var profilesController = require('controllers/profiles');
var activitiesController = require('controllers/activities');

module.exports = Backbone.Router.extend({
  routes: {
    "login": "login",
    "register": "register",
    "": "feed",
    "filter/:src": "filters",
    "caption/:id": "caption",
    "profile/:id/edit": "profileEdit",
    "profile/:username": "profileShow",
    "profile": "profileShow",
    "tagged/:username": "profileTagged",
    "hashtag/:hashtag": "hashtagPhotos",
    "photo/:id": "photoShow",
    "search": "photoSearch",
    "activity": "activity"
  },

  /**
   * execute appropriate method when the url match
   * @params callback, args, name
   */
  execute: function(callback, args, name) {
    pubsub.trigger('view:remove');
    var route = window.location.hash;

    if (route !== "#register") {
      checkUser(function(e) {
        if (e === false) {
          window.location.replace('/#login');
        };
      });
    };


    AppController.initialize();
    activitiesController.store();

    if (callback) callback.apply(this, args);
  },

  login: function() {
    profilesController.login();
  },

  register: function() {
    profilesController.register();
  },

   filters: function(src) {
    photosController.filter(src);
  },

  caption: function(id) {
    photosController.caption(id);
    photosController.autocomplete(id);
  },

  photoWork: function() {
    photosController.render();
    photosController.crop();
    photosController.upload();
  },

  feed: function() {
    photosController.list();
    this.photoWork();
  },

  photoShow: function(id) {
    photosController.item(id);
    this.photoWork();
  },

  profileEdit: function(id) {
    var user = JSON.parse(localStorage.getItem('user'));
    if(user.id === id) {
      profilesController.edit(id);
    }
  },

  profileShow: function(username) {
    var getUsername = username;

    if (!username) {
      var getUser = localStorage.getItem('user');
      getUsername = JSON.parse(getUser).username;
    };

    profilesController.item(getUsername);
    this.photoWork();
  },

  profileTagged: function(username) {
    var getUsername = username;

    if (!username) {
      var getUser = localStorage.getItem('user');
      getUsername = JSON.parse(getUser).username;
    };

    profilesController.tagged(getUsername);
    this.photoWork();
  },

  hashtagPhotos: function(hashtag) {
    photosController.hashtag(hashtag);
    this.photoWork();
  },

  photoSearch: function() {
    photosController.search();
    this.photoWork();
  },

  activity: function() {
    activitiesController.feed();
  }


});