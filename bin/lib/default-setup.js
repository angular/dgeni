var _ = require('lodash');

// Extracting docs from files
var fileReaderFactory = require('../../lib/doc-extractor');
var docExtractors = require('../../lib/doc-extractor/doc-extractors');

// Processing ngdoc tags in extracted docs
var ngDocProcessorFactory =  require('../../lib/ngdoc-parser');
var ngdocTagHandlers = require('../../lib/ngdoc-parser/ngdoc-tags');
var inlineTagHandlers = require('../../lib/ngdoc-parser/ngdoc-tags/inline');
var ngdocPlugins = require('../../lib/ngdoc-parser/ngdoc-plugins');
var parseDoc = ngDocProcessorFactory(ngdocTagHandlers, inlineTagHandlers, ngdocPlugins);

// Doc processor plugins
var docProcessorPlugins = [
  require('../../lib/doc-processor/doc-processor-plugins/ngdoc-parser')(parseDoc),
  require('../../lib/doc-processor/doc-processor-plugins/doc-merger')
];

// Doc processing
var docParserFactory = require('../../lib/doc-processor');

var docRendererFactory = require('../../lib/doc-renderer');
var customRenderFilters = require('../../lib/doc-renderer/custom-filters');
var customRenderTags = require('../../lib/doc-renderer/custom-tags');

module.exports = {
  readFiles: fileReaderFactory(docExtractors),
  processDocs: docParserFactory(docProcessorPlugins),
  renderDocsFactory: function(templatePath, outputPath) { return docRendererFactory(templatePath, outputPath, customRenderFilters, customRenderTags); }
};