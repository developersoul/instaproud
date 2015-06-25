"use strict";
var $ = require('jquery');
var Login = require('views/profile/login');
var Register = require('views/profile/register');
var Edit = require('views/profile/edit');
var Item = require('views/profile/item');
var Tagged = require('views/profile/tagged');
var UserModels = require('models/user');
var pubsub = require('utils/pubsub');
var loadImages = require('utils/loadImages');
var urls = require('config/urls');

module.exports = {

  initialize: function() {

  },

  login: function() {
    var view = new Login();
    $("#app-container").empty().append(view.render().el);
  },

  logout: function() {
    localStorage.removeItem('user');
     window.location.replace('/logout');
  },

  register: function() {
    var view = new Register();
    $("#app-container").empty().append(view.render().el);
  },

  item: function(username) {
    pubsub.trigger('appHeader:change', {title: username});
    var view = new Item();

    $.get(urls.baseUrl+'/api/users/'+ username +'/photos')
    .then(function(model) {
      $("#app-container").empty().append(view.render(model).el);
      loadImages();
    });
  },

  tagged: function(username) {
    var view = new Tagged();

    $.get('/api/users/'+ username +'/tagged')
    .then(function(model) {
      $("#app-container").empty().append(view.render(model).el);
    });
  },

  edit: function(id) {
    var data = {title: "Editar Perfil"};

    pubsub.trigger('appHeader:render', data);

    pubsub.trigger('appHeader:showCheck');

    pubsub.trigger('footerNav:remove');

    var model = new UserModels.user({id: id});
    new Edit({model: model});
    model.fetch();
  }

}