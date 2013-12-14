var myArgs = require('optimist')
  .usage('Usage: $0 path/to/files --templates=path/to/templates --output=path/to/output/folder')
  .demand(1)
  .argv;

// File reading
var fileReaderFactory = require('../lib/doc-extractor');
var docExtractors = [
  require('../lib/doc-extractors/ngdoc'),
  require('../lib/doc-extractors/js')
];
var readFiles = fileReaderFactory(docExtractors);

// Doc processing
var ngDocProcessorFactory = require('../lib/ngdoc');
var ngdocTagHandlers = [
  require('../lib/ngdoc-tags/eventType'),
  require('../lib/ngdoc-tags/param'),
  require('../lib/ngdoc-tags/property'),
  require('../lib/ngdoc-tags/requires'),
  require('../lib/ngdoc-tags/returns'),
  require('../lib/ngdoc-tags/default'),
];
var inlineTagHandlers = [];
var ngdocPlugins = [
  require('../lib/ngdoc-plugins/calculate-id'),
  require('../lib/ngdoc-plugins/calculate-path')
];
var processDoc = ngDocProcessorFactory(ngdocTagHandlers, inlineTagHandlers, ngdocPlugins);

// Doc rendering
var docRendererFactory = require('../lib/doc-renderer');
var renderDoc = docRendererFactory(myArgs.templates, myArgs.output);

// Main work
var filePath = myArgs._[0];
console.log('Reading files from ', filePath);
readFiles(filePath)
  .then(function(docs) {
    console.log('Read', docs.length, 'docs');
    docs.forEach(function(doc) {
      processDoc(doc);
      console.log('Processed doc', doc.id);
      var renderedFilePath = renderDoc('partial.html', doc);
      console.log('Rendered doc', renderedFilePath);
    });
  }).done();