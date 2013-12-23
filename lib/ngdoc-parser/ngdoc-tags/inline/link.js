var codeName = require('../../../utils/code-name');

/**
 * convert {@link} directives to real HTML anchors
 */
module.exports = function(containingTag, inlineName, inlineContent) {

  var doc = containingTag.doc;

  if ( inlineName === 'link' ) {
    var match = /(\S+)\s*(.*)/.exec(inlineContent);
    var url = match[1];
    var title = match[2];
    title.replace(/^#/g, '').replace(/\n/g, ' ');

    // We return a function here because the doc object may not yet have all the required meta data.
    // This function will be called after all the various ngdoc tags and plugins have run.
    return function generateLink() {
      var linkInfo = codeName.getLinkInfo(doc, url, title);

      if(linkInfo.type == 'code') {
        doc.links = doc.links || [];
        doc.links.push(linkInfo);
      }

      return '[`' + linkInfo.title + '`](' + linkInfo.url + ')';
    };
  }
};