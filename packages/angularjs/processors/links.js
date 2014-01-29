var _ = require('lodash');
var log = require('winston');
var walk = require('../../../lib/utils/walk');
var getLinkInfo = require('../../../lib/utils/link-info');
var INLINE_LINK = /\{@link\s+([^\s\}]+)(?:\s+([^}]+?))?\}/g;
var links;

module.exports = {
  name: 'links',
  description: 'parse inline {@link} tags and check that they are not broken',
  runAfter: ['doctrine-tag-extractor'],

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
    log.silly('=== links ===');
    _.forEach(_.map(links, 'url'), function(url) {
      log.silly(url);
    });

    var docMap = {};
    _.forEach(docs, function(doc) {
      docMap[doc.path] = doc;
    });
    log.silly('=== docs ===');
    _.forEach(docMap, function(doc, path) {
      log.silly(path);
    });

    var errCount = 0;
    _.forEach(links, function(link, url) {
      if ( link.type === 'code' && !docMap[url.split('#')[0]] ) {
        log.warn('In doc "' + link.doc.file + '" at line ' + link.doc.startingLine + ': Invalid link, "' + url + '"');
        errCount += 1;
      }
    });
    if ( errCount > 0 ) {
      log.warn(errCount + ' invalid links');
    }
  }
};