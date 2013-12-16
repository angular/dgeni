var _ = require('lodash');

// Extracting docs from files
var fileReaderFactory = require('../../lib/doc-extractor');
var docExtractors = require('../../lib/doc-extractor/doc-extractors');
var readFiles = fileReaderFactory(docExtractors);

// Processing ngdoc tags in extracted docs
var ngDocProcessorFactory =  require('../../lib/ngdoc-parser');
var ngdocTagHandlers = require('../../lib/ngdoc-parser/ngdoc-tags');
var inlineTagHandlers = require('../../lib/ngdoc-parser/ngdoc-tags/inline');
var ngdocPlugins = require('../../lib/ngdoc-parser/ngdoc-plugins');
var parseDoc = ngDocProcessorFactory(ngdocTagHandlers, inlineTagHandlers, ngdocPlugins);
var parseDocs = function(docs) {
  _.forEach(docs, function(doc) {
    parseDoc(doc);
  });
  return docs;
};

// Additional processing of extracted docs
var mergeDocs = require('../../lib/doc-processor/doc-processor-plugins/doc-merger');

// Doc processing
var docParserFactory = require('../../lib/doc-processor');
var processDocs = docParserFactory([parseDocs, mergeDocs]);

module.exports = {
  readFiles: readFiles,
  processDocs: processDocs
};