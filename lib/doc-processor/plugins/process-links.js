var _ = require('lodash');
var walk = require('../../utils/walk');
var links;

module.exports = {
  name: 'process-links',

  before: function setup(docs) {
    links = [];
  },

  each: function parseLinks(doc) {
    // Walk the tags and parse the links
  },

  after: function checkLinks(docs) {
    var docMap = {};
    _.forEach(docs, function(doc) {
      docMap[doc.id] = doc;
    });

    _.forEach(links, function(link) {
      if ( !docMap[link] ) {
        throw new Error('Invalid link, "' + link + '" in doc "' + doc.id + '"');
      }
    });
  }
};