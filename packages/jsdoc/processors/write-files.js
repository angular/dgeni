var _ = require('lodash');
var path = require('canonical-path');
var log = require('winston');
var writer = require('../../../lib/utils/doc-writer');

var outputFolder;

module.exports = {
  name: 'write-files',
  description: 'Write the renderedContent to the outputPath',
  runAfter:['writing-files'],
  runBefore: ['files-written'],
  init: function(config) {
    outputFolder = config.get('rendering, outputFolder', 'build');
  },
  process: function(docs) {
    return _.map(docs, function(doc) {

      if ( !doc.outputPath ) {
        log.error('Invalid document "' + doc.id + '" - this document has no outputPath.');
      }

      var outputFile = path.resolve(outputFolder, doc.outputPath);

      return writer.writeFile(outputFile, doc.renderedContent).then(function() {
        log.debug('Rendered doc', outputFile);
        return outputFile;
      });
    });
  }
};