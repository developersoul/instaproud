'use strict';
var $http = require('utils/http');
var pubsub = require('utils/pubsub');

module.exports = {
  initialize: function() {
    pubsub.off('activity:store');
    pubsub.off('activity:delete');
    pubsub.on('activity:store', this.store);
    pubsub.on('activity:delete', this.delete);
  },

  store: function(data) {
    $http.post('/api/activities', data, function(res) {

    });
  },

  delete: function(data) {
    $http.delete('/api/activities', data, function(res) {

    });
  }

};
