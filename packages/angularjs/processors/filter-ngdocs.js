var _ = require('lodash');

module.exports = {
  name: 'filter-ngdocs',
  before: function(docs, tagParser) {
    return _.filter(docs, function(doc) {
      return tagParser.getTag(doc.tags, 'ngdoc');
    });
  }
};