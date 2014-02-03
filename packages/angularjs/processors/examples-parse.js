var _ = require('lodash');
var log = require('winston');
var path = require('canonical-path');
var trimIndentation = require('../../../lib/utils/trim-indentation');
var code = require('../../../lib/utils/code');

var EXAMPLE_REGEX = /<example([^>]*)>([\S\s]+?)<\/example>/g;
var ATTRIBUTE_REGEX = /\s*([^=]+)\s*=\s*(?:(?:"([^"]+)")|(?:'([^']+)'))/g;
var FILE_REGEX = /<file([^>]*)>([\S\s]+?)<\/file>/g;

// A holder for all the examples that have been found in the document
var outputFolder;

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

var exampleNames;
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

function generateExampleDirective(example) {

  var html = '';

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
  name: 'examples-parse',
  description: 'Search the documentation for examples that need to be extracted',
  runAfter: ['files-loaded'],
  runBefore: ['parsing-tags'],
  init: function(config, injectables) {
    // Reset the unique name map
    exampleNames = {};

    injectables.value('examples', []);

    outputFolder = config.get('processing.examples.outputFolder', 'examples');
  },
  process: function(docs, examples) {

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

  }
};