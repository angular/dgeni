var path = require('canonical-path');
var code = require('./code');
var codeName = require('./code-name');

function trimWhitespace(str) {
  return str.replace(/(^\s+|\s+$)/g, '');
}

function getLinkInfo(doc, url, title) {
  var linkType = 'url';

  // The codeName is a code reference only if it does not contain a slash
  if ( url.indexOf('/') !== -1 ) {
    title = title || path.basename(url, '.html');
  } else if ( url.indexOf('#') === 0 ) {
    title = title || url.substring(1);
  } else {
    var codeNameParts = codeName.getAbsCodeNameParts(doc, url);
    url = codeName.getCodePath(doc, codeNameParts);
    
    // If there is no module then this is not code!!
    if ( codeNameParts.module ) {
      linkType = 'code';
    }

    if ( !title ) {
      title = codeNameParts.name || codeNameParts.module;
      if ( codeNameParts.member ) {
        title += '#' + codeNameParts.member;
      }
      title = trimWhitespace(code(title, true));
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
