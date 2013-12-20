var codeName = require('../../../utils/code-name');

/**
 * convert {@link} directives to real HTML anchors
 */
module.exports = function(doc, tagName, otherStuff) {

  if ( tagName === 'link' ) {
    var match = /(\S+)\s*(.*)/.exec(otherStuff);
    var url = match[1];
    var title = match[2];

    var linkInfo = codeName.getLinkInfo(doc, url, title);

    if(linkInfo.type == 'code') {
      doc.links = doc.links || [];
      doc.links.push(linkInfo);
    }
    title.replace(/^#/g, '').replace(/\n/g, ' ');

    return '[`' + linkInfo.title + '`](' + linkInfo.url + ')';
  }
};