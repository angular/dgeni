var _ = require('lodash');

function getCodeNameParts(codeName) {
  var match = /(?:module:([^.]+)$)|(?:module:([^.]+)\.)?(?:(directive|filter|global):)?([^#]+)(?:#(\S+))?/.exec(codeName);
  if (match) {
    return {
      module: match[1] || match[2],
      type: match[3],
      name: match[4],
      member: match[5]
    };
  } else {
    throw new Error('Invalid code name: ' + codeName);
  }
}

function getAbsCodeNameParts(currentDoc, codeName) {
  var codeNameParts = getCodeNameParts(codeName);

  // Replace missing code name parts with those from the current doc
  if ( !codeNameParts.module ) {
    codeNameParts.module = currentDoc.module;

    // We only check type if module had to be supplied from current doc
    if ( !codeNameParts.type ) {
      codeNameParts.type = currentDoc.type;
    }
  }
  return codeNameParts;
}

function getAbsoluteCodeName(currentDoc, codeName) {
  var codeNameParts = getAbsCodeNameParts(currentDoc, codeName);

  var absoluteCodeName =
    'module:'+codeNameParts.module + '.' +
    (codeNameParts.type ? codeNameParts.type + ':' : '') +
    codeNameParts.name +
    (codeNameParts.member ? '#' + codeNameParts.member : '');

  return absoluteCodeName;
}

function getCodePath(currentDoc, codeName) {
  var codeNameParts = getAbsCodeNameParts(currentDoc, codeName);
  var pathSegments = [currentDoc.section, codeNameParts.module];
  
  if(codeNameParts.type) {
    pathSegments.push(codeNameParts.type);
  }

  var name = codeNameParts.name || '';
  var member = codeNameParts.member ? ('#' + codeNameParts.member) : '';

  if(name || member) {
    pathSegments.push(name + member);
  }

  return '/' + pathSegments.join('/');
}


function getLinkInfo(doc, codeName, title) {
  var linkType, url;

  // The codeName is a code reference only if it does not contain a slash
  if ( codeName.indexOf('/') !== -1 ) {
    url = codeName;
    linkType = 'url';
  } else {
    url = getCodePath(doc, codeName);
    linkType = 'code';
  }
  return {
    url: url,
    title: title || url.split('/').pop(),
    type: linkType
  };
}

module.exports = {
  getCodeNameParts: getCodeNameParts,
  getAbsCodeNameParts: getAbsCodeNameParts,
  getAbsoluteCodeName: getAbsoluteCodeName,
  getCodePath: getCodePath,
  getLinkInfo: getLinkInfo
};