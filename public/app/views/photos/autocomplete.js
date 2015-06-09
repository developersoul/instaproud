"use strict";

var $ = require("jquery");
var _ = require('underscore');
var Backbone = require('backbone');
var pubsub = require('utils/pubsub');
var template = require('templates/photos/autocomplete.hbs');
Backbone.$ = $;

module.exports = Backbone.View.extend({
  events: {
    "click .select": "store"
  },

  initialize: function() {
    var _this = this;
    _this.listenTo(pubsub, "view:remove", _this.remove, _this);
    _this.listenTo(pubsub, "autocomplete:render", _this.render, _this);
  },

  render: function(users) {
    var _this = this;
    _this.$el.empty();
    _this.$el.append( template( users ) );
    $("#app-container").append(this.$el);
  },

  store: function(e) {
    e.preventDefault();

    var _this = this;
    var id = this.model.id;
    var userId = $(e.currentTarget).data('user');

    var data = {"tagged": userId};

    $.ajax({
      url: '/api/photos/'+ id +'/tagged',
      method: "POST",
      data: data
    })
    .then(function(res) {
      pubsub.trigger('photo:tagged', res);
      $(_this.el).find('.list-group').remove();
    });
  }

});