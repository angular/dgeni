var _ = require('lodash');
var log = require('winston');
var INLINE_LINK = /\{@link\s+([^\s\}]+)\s*(?:\s+([^}]+?))?\s*\}/g;

module.exports = {
  name: 'links',
  description: 'parse inline {@link} tags and check that they are not broken',
  runAfter: ['docs-rendered'],
  runBefore: ['writing-files'],
  process: function parseLinks(docs, partialNames) {
    _.forEach(docs, function(doc) {

      if ( doc.renderedContent ) {
        // Walk the tags and parse the links
        doc.renderedContent = doc.renderedContent.replace(INLINE_LINK, function(match, url, title) {
          var linkInfo = partialNames.getLink(url, title);
          if ( !linkInfo.valid ) {
            log.warn('Error processing link "' + match + '" for "' + doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine + ':\n' + linkInfo.error);
          }
          return _.template('<a href="${url}">${title}</a>', linkInfo);
        });
      }
    });
  }
};