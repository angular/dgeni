var myArgs = require('optimist')
  .usage('Usage: $0 path/to/files')
  .demand(1)
  .argv;

var filePath = myArgs._[0];
var setup = require('./lib/default-setup');

console.log('Reading files from ', filePath);
setup.readFiles(filePath).then(function(docs) {
  console.log('Read', docs.length, 'docs');
  docs = setup.processDocs(docs);
  docs.forEach(function(doc) {
    console.log('============================ Doc =====================\n', doc);
  });
}).done();