var log = require('winston');

// Load in the factories
var fileReaderFactory = require('../lib/doc-extractor');
var docProcessorFactory = require('../lib/doc-processor');
var docRendererFactory = require('../lib/doc-renderer');

module.exports = function docGeneratorFactory(config) {

  // Create the processing functions from the factories and the configuration
  var readFiles = fileReaderFactory(config.source.extractors);
  var processDocs = docProcessorFactory(config);
  var templateFinder = config.rendering.templateFinderFactory(config.rendering.templatePath, config.rendering.templateExtension);
  var renderDocs = docRendererFactory(config.rendering.templatePath, config.rendering.outputPath, templateFinder, config.rendering.filters, config.rendering.tags);

  return {
    readFiles: function(files) { return readFiles(files || config.source.files); },
    processDocs: processDocs,
    renderDocs: function(docs, extra) { renderDocs(docs, extra | config.rendering.extra); },
    generateDocs: function() {
      return readFiles(config.source.files).then(function(docs) {
        log.info('Read', docs.length, 'docs');
        docs = processDocs(docs);
        log.info('Processed', docs.length, 'docs');
        return renderDocs(docs, config.rendering.extra)
        .then(function(filePaths) {
          log.info('Rendered', filePaths.length, 'files');
        });
      });
    }
  };
};