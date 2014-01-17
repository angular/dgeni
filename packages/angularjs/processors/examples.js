var _ = require('lodash');
var log = require('winston');
var walk = require('../../../lib/utils/walk');
var EXAMPLE_REGEX = /<example([^>]*)>([\S\s]+?)<\/example>/g;
var ATTRIBUTE_REGEX = /\s*([^=]+)\s*=\s*(?:(?:"([^"]+)")|(?:'([^']+)'))/g;
var FILE_REGEX = /<file([^>]*)>([\S\s]+?)<\/file>/g;

// A holder for all the examples that have been found in the document
var examples;

function extractAttributes(attributeText) {
  var attributes = {};
  attributeText.replace(ATTRIBUTE_REGEX, function(match, prop, val1, val2){
    attributes[prop] = val1 || val2;
  });
  return attributes;
}

function extractFiles(exampleText) {
  var files = {};
  exampleText.replace(FILE_REGEX, function(match, attributesText, contents) {
    var attributes = extractAttributes(attributesText);
    if ( !attributes.name ) {
      throw new Error('Missing name attribute in example');
    }

    // Extract the contents of the file
    attributes.fileContents = contents;

    // Store this file information
    files[attributes.name] = attributes;
  });
  return files;
}

function processExample(match, attributeText, exampleText) {
  var example = extractAttributes(attributeText);
  example.files = extractFiles(exampleText);
  example.id = examples.length;
  
  // store the example information for later
  examples.push(example);
}

module.exports = {
  name: 'examples',
  description: 'Search the documentation for examples that need to be extracted',
  init: function(config) {
    examples = [];
  },
  each: function(doc) {

    // Walk the properties of the document and parse the examples
    walk(doc, function(property, key) {
      if ( _.isString(property) ) {
        property.replace(EXAMPLE_REGEX, processExample);
      }
      return property;
    });
  },

  after: function(docs) {
    // Create new documents (which will be rendered as javascript) for each of the examples
    log.info(require('util').inspect(examples, { depth: 4 }));
  }
};