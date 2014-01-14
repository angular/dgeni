var _ = require('lodash');
var log = require('winston');
var walk = require('../../../lib/utils/walk');
var EXAMPLE_REGEX = /<doc:example([^>]*)>([\S\s]+?)<\/doc:example>/g;
var ATTRIBUTE_REGEX = /\s*([^=]+)\s*=\s*(?:(?:"([^"]+)")|(?:'([^']+)'))/g;
var FILE_REGEX = /<doc:file([^>]*)>([\S\s]+?)<\/doc:file>/g;

// A holder for all the examples that have been found in the document
var examples;

module.exports = {
  name: 'examples',
  description: 'Search the documentation for examples that need to be extracted',
  before: function(docs) {
    examples = [];
  },
  each: function(doc) {

    function extractAttributes(attributeText) {
      var matches = attributeText.match(ATTRIBUTE_REGEX);
      var attributes = {};
      _.forEach(matches, function(match) {
        attributes[match[1]] = match[2];
      });
      return attributes;
    }

    function extractFiles(exampleText) {
      var matches = content.match(FILE_REGEX);
      var files = {};
      _.forEach(matches, function(match) {
        
        var attributes = extractAttributes(match[1]);
        if ( !attributes.name ) {
          throw new Error('Missing name attribute in example for document "' + doc.id + '"');
        }

        // Extract the cotents of the file
        attributes.fileContent = match[2];

        // Store this file information
        files[attributes.name] = attributes;
      });
    }

    function processExample(match, attributeText, exampleText) {
      var attributes = extractAttributes(attributeText);
      attributes.files = extractFiles(exampleText);
      attributes.id = examples.length;
      
      // store the example information for later
      examples.push(attributes);

      // replace with an angular directive that can connect to the stored example
      // i.e. via id
    }

    // Walk the properties of the document and parse the examples
    walk(doc, function(property, key) {
      if ( _.isString(property) ) {
        return property.replace(EXAMPLE_REGEX, processExample);
      } else {
        return property;
      }
    });
  },

  after: function(docs) {
    // Create new documents (which will be rendered as javascript) for each of the examples
  }
};