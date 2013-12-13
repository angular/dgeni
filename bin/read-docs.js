var myArgs = require('optimist')
  .usage('Usage: $0 path/to/files')
  .demand(1)
  .argv;

var fileReaderFactory = require('../lib/doc-extractor');
var docExtractors = [
  require('../lib/doc-extractors/ngdoc'),
  require('../lib/doc-extractors/js')
];

var filePath = myArgs._[0];
var readFiles = fileReaderFactory(docExtractors);
readFiles(filePath).then(function(docs) {
  console.log(docs);
});
