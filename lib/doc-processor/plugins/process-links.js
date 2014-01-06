var _ = require('lodash');
var walk = require('../../utils/walk');
var getLinkInfo = require('../../utils/link-info');
var INLINE_LINK = /\{@link\s+([^\s\}]+)(?:\s+([^}]+?))?\}/g;
var links;

module.exports = {
  name: 'process-links',

  before: function setup(docs) {
    links = {};
  },

  each: function parseLinks(doc) {
    // Walk the tags and parse the links
    walk(doc, function(property, key) {
      if ( _.isString(property) ) {
        return property.replace(INLINE_LINK, function(match, url, title) {
          var linkInfo = getLinkInfo(doc, url, title);
          links[linkInfo.url] = linkInfo;
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

    _.forEach(links, function(link, url) {
      if ( link.type === 'code' && !docMap[url.split('#')[0]] ) {
        console.log('Invalid link, "' + link.url + '" in doc "' + link.doc.file + '" at line ' + link.doc.startingLine);
      }
    });
  }
};