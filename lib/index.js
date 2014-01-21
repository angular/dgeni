var log = require('winston');

// Load in the factories
var fileReaderFactory = require('../lib/doc-extractor');
var docProcessorFactory = require('../lib/doc-processor');
var docRendererFactory = require('../lib/doc-renderer');

module.exports = function docGeneratorFactory(config) {

  log.debug('Initializing components');
  // Create the processing functions from the factories and the configuration
  var readFiles = fileReaderFactory(config);

  var processDocs = docProcessorFactory(config);

  var renderDocs = docRendererFactory(config);

  return {
    readFiles: function(files) { return readFiles(files || config.source.files); },
    processDocs: processDocs,
    renderDocs: function(docs, extra) { renderDocs(docs, extra | config.rendering.extra); },
    generateDocs: function() {
      log.info('Reading docs');
      return readFiles(config.source.files).then(function(docs) {
        log.info('Read', docs.length, 'docs');
        log.info('Processing docs');
        docs = processDocs(docs);
        log.info('Processed', docs.length, 'docs');
        log.info('Rendering docs');
        return renderDocs(docs, config.rendering.extra)
        .then(function(filePaths) {
          log.info('Rendered', filePaths.length, 'files');
        });
      });
    }
  };
};