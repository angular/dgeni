var _ = require('lodash');
var log = require('winston');

module.exports = {
  name: 'filter-ngdocs',
  runAfter: ['doctrine-tag-parser'],
  before: function(docs) {
    var docCount = docs.length;
    docs = _.filter(docs, function(doc) {
      return doc.tags.getTag('ngdoc');
    });
    log.debug('filtered ' + (docCount - docs.length) + ' docs');
    return docs;
  }
};