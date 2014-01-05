var _ = require('lodash');
var walk = require('../../utils/walk');
var codeName = require('../../utils/code-name');
var INLINE_LINK = /\{@link\s+(\S+)\s*([^}]+?)\}/;
var links;

module.exports = {
  name: 'process-links',

  before: function setup(docs) {
    links = [];
  },

  each: function parseLinks(doc) {
    // Walk the tags and parse the links
    walk(doc, function(property, key) {
      if ( _.isString(property) ) {
        return property.replace(INLINE_LINK, function(match, url, title) {
          var linkInfo = codeName.getLinkInfo(doc, url, title);
          links.push(linkInfo);
          return linkInfo.anchorElement;
        });
      }
      return property;
    });
  },

  after: function checkLinks(docs) {
    console.log('=== links ===');
    console.log(_.map(links, 'url'));
    var docMap = {};
    _.forEach(docs, function(doc) {
      docMap[doc.path] = doc;
    });

    _.forEach(links, function(link) {
      if ( link.type === 'code' && !docMap[link.url] ) {
        throw new Error('Invalid link, "' + link.url + '" in doc "' + link.doc.file + '" at line ' + link.doc.startingLine);
      }
    });
  }
};