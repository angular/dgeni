var path = require('canonical-path');
var code = require('./code');
var codeName = require('./code-name');

function trimWhitespace(str) {
  return str.replace(/(^\s+|\s+$)/g, '');
}

function getLinkInfo(doc, url, title) {
  var linkType;

  // The codeName is a code reference only if it does not contain a slash
  if ( url.indexOf('/') !== -1 ) {
    linkType = 'url';
    title = title || path.basename(url, '.html');
  } else {
    var codeNameParts = codeName.getAbsCodeNameParts(doc, url);
    url = codeName.getCodePath(doc, codeNameParts);
    linkType = 'code';

    if ( !title ) {
      title = codeNameParts.name || codeNameParts.module;
      if ( codeNameParts.member ) {
        title += '#' + codeNameParts.member;
      }
      title = trimWhitespace(code(title));
    }
  }

  return {
    doc: doc,
    url: url,
    title: title,
    type: linkType,
    anchorElement: '<a href="'+url+'">'+title+'</a>'
  };
}

module.exports = getLinkInfo;
