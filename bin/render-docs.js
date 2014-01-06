var _ = require('lodash');
var log = require('../lib/utils/log');
var myArgs = require('optimist')
  .usage('Usage: $0 path/to/files --templates=path/to/templates --output=path/to/output/folder')
  .demand(1)
  .argv;

var filePath = myArgs._[0];
var docGenerator = require('./lib/default-setup');
var renderDocs = docGenerator.renderDocsFactory(myArgs.templates, myArgs.output);

// Extra data
var git = {
  // TODO: Get this from somewhere
  tag: "v1.2.6-build.1989+sha.b0474cb"
};

// Main work
log.info('Reading files from ', filePath);
docGenerator.readFiles(filePath)

  .then(function(docs) {
    log.info('Read', docs.length, 'docs');
    docs = docGenerator.processDocs(docs);
    _.forEach(docs, function(doc) {
      log.info('Processed doc', doc.id);
    });
    return renderDocs(docs, {git: git});
  })

  .then(function(renderedFilePaths) {
    _.forEach(renderedFilePaths, function(renderedFilePath) {
      log.info('Rendered doc', renderedFilePath);
    });
  })

  .done();