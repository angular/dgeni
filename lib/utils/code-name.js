var _ = require('lodash');
var path = require('canonical-path');
var checkProperty = require('./check-property');

function getCodeNameParts(codeName) {
  var match = /(?:module:([^.]+)$)|(?:module:([^.]+)\.)?(?:(directive|filter|global):)?([^#]+)(?:#(\S+))?/.exec(codeName);
  if (match) {
    return {
      module: match[1] || match[2],
      componentType: match[3],
      name: match[4],
      member: match[5],
      isModule: !!match[1]
    };
  } else {
    throw new Error('Invalid code name: ' + codeName);
  }
}

function getAbsCodeNameParts(currentDoc, codeName) {

  var codeNameParts = getCodeNameParts(codeName);

  // Replace missing code name parts with those from the current doc
  if ( !codeNameParts.module ) {
    checkProperty(currentDoc, 'module');

    codeNameParts.module = currentDoc.module;

    // We only check componentType if module had to be supplied from current doc
    if ( !codeNameParts.componentType ) {
      checkProperty(currentDoc, 'componentType');
      codeNameParts.componentType = currentDoc.componentType;
    }
  }
  return codeNameParts;
}

function getAbsoluteCodeName(currentDoc, codeName) {
  var codeNameParts = getAbsCodeNameParts(currentDoc, codeName);

  var absoluteCodeName =
    'module:'+codeNameParts.module + '.' +
    (codeNameParts.componentType ? codeNameParts.componentType + ':' : '') +
    codeNameParts.name +
    (codeNameParts.member ? '#' + codeNameParts.member : '');

  return absoluteCodeName;
}

function getCodePath(currentDoc, codeNameParts) {
  var pathSegments = [currentDoc.section, codeNameParts.module];
  
  if(codeNameParts.componentType) {
    pathSegments.push(codeNameParts.componentType);
  }

  var name = codeNameParts.name ? (codeNameParts.name) : '';
  var member = codeNameParts.member ? ('#' + codeNameParts.member) : '';

  if (name) {
    pathSegments.push(name + member);
  } else {
    // We have a module overview
    pathSegments.push('index.html');
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
    var codeNameParts = getAbsCodeNameParts(doc, codeName);
    url = getCodePath(doc, codeNameParts);
    title = title || codeNameParts.name || codeNameParts.module;
    linkType = 'code';
  }
  return {
    url: url,
    title: title || path.basename(url, '.html'),
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