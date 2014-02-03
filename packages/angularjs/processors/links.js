var _ = require('lodash');
var log = require('winston');
var walk = require('../../../lib/utils/walk');
var INLINE_LINK = /\{@link\s+([^\s\}]+)(?:\s+([^}]+?))?\}/g;

module.exports = {
  name: 'links',
  description: 'parse inline {@link} tags and check that they are not broken',
  runAfter: ['id'],
  runBefore: ['docs-processed'],
  process: function parseLinks(docs, partialNames) {
    _.forEach(docs, function(doc) {

      // Walk the tags and parse the links
      walk(doc, function(property, key) {
        if ( _.isString(property) ) {
          return property.replace(INLINE_LINK, function(match, url, title) {
            var linkInfo = partialNames.getLink(url, title);
            if ( !linkInfo.valid ) {
              log.warn('Error processing links for "' + doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine + ':\n' + linkInfo.error);
            }
            return _.template('<a href="${url}">${title}</a>', linkInfo);
          });
        }
        return property;
      });
    });
  }
};