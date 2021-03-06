'use strict';
var React = require('react');
var $ = require('jquery');
var Login = require('views/profile/login.jsx');
var Register = require('views/profile/register.jsx');
var Edit = require('views/profile/edit.jsx');
var Tagged = require('views/profile/Tagged.jsx');
var Profile = require('views/profile/profile.jsx');
var ChangePassword = require('views/profile/change_password.jsx');
var RecoverPassword = require('views/profile/recover_password.jsx');
var pubsub = require('utils/pubsub');

module.exports = {

  login: function() {
    React.unmountComponentAtNode(document.getElementById('header-container'));
    React.unmountComponentAtNode(document.getElementById('nav-container'));
    React.render(<Login />, document.getElementById('app-container'));
  },

  logout: function() {
    React.unmountComponentAtNode(document.getElementById('header-container'));
    React.unmountComponentAtNode(document.getElementById('nav-container'));
    localStorage.removeItem('user');
    window.location.replace('/logout');
  },

  register: function() {
    React.unmountComponentAtNode(document.getElementById('header-container'));
    React.unmountComponentAtNode(document.getElementById('nav-container'));
    React.render(<Register />, document.getElementById('app-container'));
  },

  item: function(username) {
    React.render(<Profile username={username}/> , document.getElementById("app-container"));
    pubsub.trigger('appHeader:change', {title: username});
    pubsub.trigger('appHeader:showCloseSession');
  },

  tagged: function(username) {
    console.log(username);
    React.render(<Tagged username={username} /> , document.getElementById("app-container"));
    pubsub.trigger('appHeader:change', {title: username});
    pubsub.trigger('appHeader:showCloseSession');
  },

  edit: function(id) {
    var user = JSON.parse(localStorage.getItem('user'));
    if(user.id === id) {
      React.unmountComponentAtNode(document.getElementById('nav-container'));
      React.render(<Edit userId={id} />, document.getElementById("app-container"));
    }
  },

  changePassword: function(id) {
    React.unmountComponentAtNode(document.getElementById('nav-container'));
    React.render(<ChangePassword userId={id} />, document.getElementById("app-container"));
  },

  recoverPassword: function(id, salt) {
    React.unmountComponentAtNode(document.getElementById('nav-container'));
    React.render(<RecoverPassword userId={id} salt={salt} />, document.getElementById("app-container"));
  }

};
