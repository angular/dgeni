var _ = require('lodash');
var tags = require('../../utils/tags');

module.exports = {
  name: 'filter-ngdocs',
  before: function(docs) {
    return _.filter(docs, function(doc) {
      return tags.getTag(doc.tags, 'ngdoc');
    });
  }
};