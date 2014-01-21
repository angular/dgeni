var _ = require('lodash');
var log = require('winston');
var path = require('canonical-path');
var walk = require('../../../lib/utils/walk');
var EXAMPLE_REGEX = /<example([^>]*)>([\S\s]+?)<\/example>/g;
var ATTRIBUTE_REGEX = /\s*([^=]+)\s*=\s*(?:(?:"([^"]+)")|(?:'([^']+)'))/g;
var FILE_REGEX = /<file([^>]*)>([\S\s]+?)<\/file>/g;

// A holder for all the examples that have been found in the document
var examples, exampleNames, templateFolder;

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
    var file = extractAttributes(attributesText);
    if ( !file.name ) {
      throw new Error('Missing name attribute in file: ' + match);
    }

    // Extract the contents of the file
    file.fileContents = contents;
    file.type = file.type || path.extname(file.name).substr(1) || 'file';

    // Store this file information
    files[file.name] = file;
  });
  return files;
}

function uniqueName(name) {
  if ( exampleNames[name] ) {
    var index = 1;
    while(exampleNames[name + index]) {
      index += 1;
    }
    name = name + index;
  }
  exampleNames[name] = true;
  return name;
}

module.exports = {
  name: 'examples',
  description: 'Search the documentation for examples that need to be extracted',
  requires: ['doctrine-tag-extractor'],
  init: function(config) {
    examples = [];
    exampleNames = {};
    templateFolder = 'examples';
  },
  each: function(doc) {

    function processExample(match, attributeText, exampleText) {
      var example = extractAttributes(attributeText);
      example.files = extractFiles(exampleText);
      example.id = uniqueName(example.name || 'example');
      example.doc = doc;
      
      // store the example information for later
      examples.push(example);
    }

    // Walk the properties of the document and parse the examples
    walk(doc, function(property, key) {
      if ( _.isString(property) ) {
        property.replace(EXAMPLE_REGEX, processExample);
      }
      return property;
    });
  },

  after: function(docs) {
    _.forEach(examples, function(example) {
      var outputFolder = path.join('examples', example.id);
      
      // Create a new document for the example
      var exampleDoc = {
        docType: 'example',
        template: path.join(templateFolder, 'index.template.html'),
        file: example.doc.file,
        startingLine: example.doc.startingLine,
        example: example,
        path: outputFolder,
        outputPath: path.join(outputFolder, 'index.html')
      };
      // If there is an index.html file specified then use it contents for this doc
      // and remove it from the files property
      if ( example.files['index.html'] ) {
        exampleDoc.fileContents = example.files['index.html'].fileContents;
        delete example.files['index.html'];
      }
      docs.push(exampleDoc);

      // Create a new document for each file of the example
      _.forEach(example.files, function(file) {
        var fileDoc = {
          docType: 'example-' + file.type,
          template: path.join(templateFolder, 'template.' + file.type),
          file: example.doc.file,
          startingLine: example.doc.startingLine,
          example: example,
          path: path.join(outputFolder, file.name),
          outputPath: path.join(outputFolder, file.name),
          fileContents: file.fileContents
        };
        docs.push(fileDoc);
      });
    });
  }
};