var _ = require('lodash');
var log = require('../../utils/log');
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
    log.info('=== links ===');
    log.info(_.map(links, 'url'));
    var docMap = {};
    _.forEach(docs, function(doc) {
      docMap[doc.path] = doc;
    });

    var errCount = 0;
    _.forEach(links, function(link, url) {
      if ( link.type === 'code' && !docMap[url.split('#')[0]] ) {
        log.warning('In doc "' + link.doc.file + '" at line ' + link.doc.startingLine + ': Invalid link, "' + link.url + '"');
        errCount += 1;
      }
    });
    if ( errCount > 0 ) {
      log.warning(errCount + ' invalid links');
    }
  }
};