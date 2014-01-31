var _ = require('lodash');
var checkProperty = require('./check-property');
var code = require('./code.js');

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
    if ( currentDoc.fileType == 'js' ) {
      checkProperty(currentDoc, 'module');
    }

    // Set the module or default to ng there is none
    codeNameParts.module = currentDoc.module;

    // We only check componentType if module had to be supplied from current doc
    if ( !codeNameParts.componentType ) {
      if ( currentDoc.fileType == 'js' ) {
        checkProperty(currentDoc, 'componentType');
      }
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
  var pathSegments = [currentDoc.area];

  if ( codeNameParts.module ) {
    pathSegments.push(codeNameParts.module);
  }
  
  if(codeNameParts.componentType) {
    pathSegments.push(codeNameParts.componentType);
  }

  var name = codeNameParts.name ? (codeNameParts.name) : '';
  var member = codeNameParts.member ? ('#' + codeNameParts.member) : '';

  if (name) {
    pathSegments.push(name + member);
  }

  return pathSegments.join('/');
}

module.exports = {
  getCodeNameParts: getCodeNameParts,
  getAbsCodeNameParts: getAbsCodeNameParts,
  getAbsoluteCodeName: getAbsoluteCodeName,
  getCodePath: getCodePath
};