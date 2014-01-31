var _ = require('lodash');
var log = require('winston');
var path = require('canonical-path');
var trimIndentation = require('../../../lib/utils/trim-indentation');
var code = require('../../../lib/utils/code');

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
    file.fileContents = trimIndentation(contents);
    file.language = path.extname(file.name).substr(1);
    file.type = file.type || file.language || 'file';

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
    outputPath: example.outputPath,
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

function generateExampleDirective(example) {

  var html = ''

    // Be aware that we need these extra new lines here or marked will not realise that the <div>
  // above is HTML and wrap each line in a <p> - thus breaking the HTML
  html += '\n\n';
  
  // Write out the runnable-example directive
  html += '<div class="runnable-example"';
  _.forEach(_.omit(example, ['files', 'doc']), function(value, key) {
    html += ' ' + key + '="' + value + '"';
  });
  html += '>\n';

  // Write each of the files as a runnable-example-file directive
  _.forEach(example.files, function(file) {
    html += '  <div class="runnable-example-file"';
    _.forEach(_.omit(file, ['fileContents']), function(value, key) {
      html += ' ' + key + '="' + value + '"';
    });
    html += '>\n';
    html += code(file.fileContents, false, file.language) + '\n';
    html += '  </div>\n';
  });

  // Write out the iframe that will host the runnable example
  html += '<iframe class="runnable-example-frame" src="' + example.outputPath + '" name="' + example.id + '"></iframe>\n';

  html += '</div>';

  // Be aware that we need these extra new lines here or marked will not realise that the <div>
  // above is HTML and wrap each line in a <p> - thus breaking the HTML
  html += '\n\n';
  
  return html;
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
  before: function(docs) {

    _.forEach(docs, function(doc) {
      doc.content = doc.content.replace(EXAMPLE_REGEX, function processExample(match, attributeText, exampleText) {
        var example = extractAttributes(attributeText);
        example.files = extractFiles(exampleText);
        example.id = 'example-' + uniqueName(example.name || 'example');
        example.doc = doc;
        example.outputPath = outputPath(example, 'index.html');
        
        // store the example information for later
        examples.push(example);

        return generateExampleDirective(example);
      });
    });
  },

  after: function(docs) {
    _.forEach(examples, function(example) {

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