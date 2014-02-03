var _ = require('lodash');
var path = require('canonical-path');
var code = require('./code.js');
var log = require('winston');

/**
 * Parse the code name into parts
 * @param  {String} codeName The full code name that will be parsed
 * @return {Array}          An array of parts that have been parsed from the code name
 */
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

/**
 * Get a list of all the partial code names that can be made from the provided set of parts
 * @param  {Array} codeNameParts A collection of parts for a code name
 * @return {Array}               A collection of partial names
 */
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

/**
 * A map of partial names to docs
 */
function PartialNames(docs) {
  this.map = {};
  that = this;
  _.forEach(docs, function(doc) {
    that.addDoc(doc);
  });
}

/**
 * Add a new document to the map associating it with each of its potential partial names
 * @param {Object} doc The document to add to the map
 */
PartialNames.prototype.addDoc = function(doc) {

  var map = this.map;

  doc.partialNames = _getPartialNames(_parseCodeName(doc.id));

  // We now store references to this doc under all its partial names in the partialNames map
  // This map will be used to match relative links later on
  _.forEach(doc.partialNames, function(partialName) {

    // Try to get a list of docs that match this partialName    
    var matchedDocs = map[partialName];
  
    if ( !matchedDocs ) {
      // This partial name is not yet used - add it to the map
      map[partialName] = doc;

    } else {
  
      if ( _.isArray(matchedDocs) ) {
        // There are already more than one docs associated with this partialName - add this one too
        matchedDocs.push(doc);
      } else {
        // There is already one doc associated with this partialName - convert the entry to an array
        matchedDocs = [matchedDocs, doc];
      }

      // Add the array of matchedDocs back to the map
      map[partialName] = matchedDocs;
    }
  });

};


PartialNames.prototype.getDoc = function(partialName) {
  return this.map[partialName];
};

/**
 * Get link information to a document that matches the given url
 * @param  {String} url   The url to match
 * @param  {String} title An optional title to return in the link information
 * @return {Object}       The link information
 */
PartialNames.prototype.getLink = function(url, title) {
  var linkInfo = {
    url: url,
    type: 'url',
    valid: true,
    title: title || url
  };

  if ( !url ) {
    throw new Error('Invalid url');
  }

  var doc = this.map[url];

  if ( _.isArray(doc) ) {

    linkInfo.valid = false;
    linkInfo.error = 'Ambiguous link: "' + url + '".\n' +
      _.reduce(doc, function(msg, doc) { return msg + '\n  "' + doc.id + '"'; }, 'Matching docs: ');

  } else if ( doc ) {

    linkInfo.url = doc.path;
    linkInfo.title = title || code(doc.name, true);
    linkInfo.type = 'doc';

  } else if ( url.indexOf('#') > 0 ) {

    linkInfo = this.getLink(url.split('#')[0]);
    return linkInfo;

  } else if ( url.indexOf('/') === -1 && url.indexOf('#') !== 0 ) {

    linkInfo.valid = false;
    linkInfo.error = 'Invalid link (does not match any doc): "' + url + '"';

  } else {

    linkInfo.title = title || (( url.indexOf('#') === 0 ) ? url.substring(1) : path.basename(url, '.html'));

  }

  return linkInfo;
};

module.exports = {
  PartialNames: PartialNames
};