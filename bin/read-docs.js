var myArgs = require('optimist')
  .usage('Usage: $0 path/to/files')
  .demand(1)
  .argv;

var filePath = myArgs._[0];

var readFiles = require('./lib/default-setup').readFiles;

readFiles(filePath).then(function(docs) {
  console.log(docs);
});
