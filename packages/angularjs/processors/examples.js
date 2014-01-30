var _ = require('lodash');
var log = require('winston');
var path = require('canonical-path');
var walk = require('../../../lib/utils/walk');
var EXAMPLE_REGEX = /<example([^>]*)>([\S\s]+?)<\/example>/g;
var ATTRIBUTE_REGEX = /\s*([^=]+)\s*=\s*(?:(?:"([^"]+)")|(?:'([^']+)'))/g;
var FILE_REGEX = /<file([^>]*)>([\S\s]+?)<\/file>/g;

// A holder for all the examples that have been found in the document
var examples, exampleNames, templateFolder, outputFolder;

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

function outputPath(example, fileName) {
  return path.join(outputFolder, example.id, fileName);
}

function createExampleDoc(example) {
  var exampleDoc = {
    id: example.id,
    docType: 'example',
    template: path.join(templateFolder, 'index.template.html'),
    file: example.doc.file,
    startingLine: example.doc.startingLine,
    example: example,
    path: example.id,
    outputPath: outputPath(example, 'index.html'),
    scripts: [],
    stylesheets: []
  };

  // If there is an index.html file specified then use it contents for this doc
  // and remove it from the files property
  if ( example.files['index.html'] ) {
    exampleDoc.fileContents = example.files['index.html'].fileContents;
    delete example.files['index.html'];
  }
  return exampleDoc;
}

function createFileDoc(example, file) {
  var fileDoc = {
    docType: 'example-' + file.type,
    id: example.id + '/' + file.name,
    template: path.join(templateFolder, 'template.' + file.type),
    file: example.doc.file,
    startingLine: example.doc.startingLine,
    example: example,
    path: file.name,
    outputPath: outputPath(example, file.name),
    fileContents: file.fileContents
  };
  return fileDoc;
}

module.exports = {
  name: 'examples',
  description: 'Search the documentation for examples that need to be extracted',
  runBefore: ['doctrine-tag-parser'],
  init: function(config) {
    examples = [];
    exampleNames = {};
    templateFolder = config.get('processing.examples.templateFolder', 'examples');
    outputFolder = config.get('processing.examples.templateFolder', 'examples');
  },
  each: function(doc) {

    // Walk the properties of the document and parse the examples
    doc.content = doc.content.replace(EXAMPLE_REGEX, function processExample(match, attributeText, exampleText) {
      var example = extractAttributes(attributeText);
      example.files = extractFiles(exampleText);
      example.id = uniqueName(example.name || 'example');
      example.doc = doc;
      
      // store the example information for later
      examples.push(example);

      return match.replace('<example ', '<example id="' + example.id + '" ');
    });
  },

  after: function(docs) {
    _.forEach(examples, function(example) {
      var outputFolder = path.join('examples', example.id);
      
      // Create a new document for the example
      var exampleDoc = createExampleDoc(example);
      docs.push(exampleDoc);

      // Create a new document for each file of the example
      _.forEach(example.files, function(file) {
        var fileDoc = createFileDoc(example, file);
        docs.push(fileDoc);

        // Store a reference to the fileDoc in the relevant property on the exampleDoc
        if ( file.type == 'css' ) {
          exampleDoc.stylesheets.push(fileDoc);
        } else if ( file.type == 'js' ) {
          exampleDoc.scripts.push(fileDoc);
        }
      });
    });
  }
};