var myArgs = require('optimist')
  .usage('Usage: $0 path/to/files')
  .demand(1)
  .argv;

var fileReaderFactory = require('../lib/doc-extractor');
var docExtractors = [
  require('../lib/doc-extractors/ngdoc'),
  require('../lib/doc-extractors/js')
];
var readFiles = fileReaderFactory(docExtractors);

var ngDocProcessorFactory = require('../lib/ngdoc');
var ngdocTagHandlers = [
  require('../lib/ngdoc-tags/eventType'),
  require('../lib/ngdoc-tags/param'),
  require('../lib/ngdoc-tags/property'),
  require('../lib/ngdoc-tags/requires'),
  require('../lib/ngdoc-tags/returns'),
  require('../lib/ngdoc-tags/default'),
];
var processDoc = ngDocProcessorFactory(ngdocTagHandlers, []);

var filePath = myArgs._[0];

console.log('Reading files from ', filePath);
readFiles(filePath)
  .then(function(docs) {
    console.log('Read', docs.length, 'docs');
    docs.forEach(function(doc) {
      processDoc(doc);
      console.log('============================ Doc =====================\n', doc);
    });
  });