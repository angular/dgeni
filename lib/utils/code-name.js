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

function _parseCodeName(codeName) {
  var parts = [];
  var currentPart;

  _.forEach(codeName.split('.'), function(part) {
    var subParts = part.split(':');

    var name = subParts.pop();
    var modifier = subParts.pop();

    if ( !modifier && currentPart  ) {
      currentPart.name += '.' + name;
    } else {
      currentPart = {
        name: name,
        modifier: modifier
      };
      parts.push(currentPart);
    }
  });
  return parts;
}

function _getPartialNames(codeNameParts) {

  var methodName;
  var partialNames = [];
  // Add the last part to the list of partials
  var part = codeNameParts.pop();

  // If the name contains a # then it is a member and that should be included in the partial names
  if ( part.name.indexOf('#') !== -1 ) {
    methodName = part.name.split('#')[1];
  }
  // Add the part name and modifier, if provided
  partialNames.push(part.name);
  if (part.modifier) {
    partialNames.push(part.modifier + ':' + part.name);
  }

  // Continue popping off the parts of the codeName and work forward collecting up each partial
  _.forEachRight(codeNameParts, function(part) {

    // Add this part to each of the partials we have so far
    _.forEach(partialNames, function(name) {

      // Add the part name and modifier, if provided
      partialNames.push(part.name + '.' + name);
      if ( part.modifier ) {
        partialNames.push(part.modifier + ':' + part.name + '.' + name);
      }
    });

  });

  if ( methodName ) {
    partialNames.push(methodName);
  }

  return partialNames;
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
  getCodePath: getCodePath,
  getPartialNames: function(codeName) { return _getPartialNames(_parseCodeName(codeName)); }
};