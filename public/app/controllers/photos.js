'use strict';
var React = require('react');
var $http = require('utils/http');
var pubsub = require('utils/pubsub');
var Search = require('views/photos/search.jsx');
var List = require('views/photos/list.jsx');
var Crop = require('views/photos/crop.jsx');
var Filter = require('views/photos/filter.jsx');
var Caption = require('views/photos/caption.jsx');
var Hashtag = require('views/photos/hashtag.jsx');
var Photo = require('views/photos/item.jsx');
var isMobile = require('is-mobile');
var Map = require('views/photos/locations.jsx');

module.exports = {
  map: function() {
    React.render(<Map />, document.getElementById('app-container'));
  },

  list: function() {
    React.render(<List />, document.getElementById('app-container'));
  },

  item: function(id) {
    $http.get('/api/photos/' + id, null, function(res) {
      React.render(<Photo photo={res} />, document.getElementById('app-container'));
    });
  },

  crop: function() {
    React.unmountComponentAtNode(document.getElementById('nav-container'));
    pubsub.trigger('appHeader:change', {bgColor: "444"});
    React.render(<Crop />, document.getElementById('app-container'));
  },

  filter: function(src) {
    if (isMobile()) {
      React.unmountComponentAtNode(document.getElementById('header-container'));
    }
    React.unmountComponentAtNode(document.getElementById('nav-container'));
    React.render(<Filter />, document.getElementById('app-container'));
    pubsub.trigger('appHeader:change', {bgColor: "444"});
  },

  caption: function(id) {
    if (isMobile()) {
      React.unmountComponentAtNode(document.getElementById('header-container'));
    }
    React.unmountComponentAtNode(document.getElementById('nav-container'));
    React.render(<Caption />, document.getElementById('app-container'));
    pubsub.trigger('appHeader:change', { bgColor: "444"});
  },

  hashtag: function(hashtag) {
    pubsub.trigger('appHeader:change', {title: "#" + hashtag});
    React.render(<Hashtag hashtag={hashtag} />, document.getElementById('app-container'));
  },

  search: function() {
    React.render(<Search />, document.getElementById("app-container"));
  }
 }
