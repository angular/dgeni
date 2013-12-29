var _ = require('lodash');

module.exports = {
  getTag: function(tags, name) {
    return _.find(tags, { title: name});
  },
  getTags: function(tags, name) {
    return _.where(tags, { title: name});
  }
};