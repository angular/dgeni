var _ = require('lodash');
var doctrine = require('doctrine');

module.exports = {
  getTag: function(tags, name) {
    return _.find(tags, { title: name});
  },
  getTags: function(tags, name) {
    return _.where(tags, { title: name});
  },
  getType: function(tag) {
    return doctrine.type.stringify(tag.type);
  }
};