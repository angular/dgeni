var fileReaderFactory = require('../../lib/doc-extractor');
var docExtractors = [
    require('../../lib/doc-extractors/ngdoc'),
    require('../../lib/doc-extractors/js')
  ];
var ngDocProcessorFactory =  require('../../lib/ngdoc-parser');
var ngdocTagHandlers = [
  require('../../lib/ngdoc-tags/eventType'),
  require('../../lib/ngdoc-tags/param'),
  require('../../lib/ngdoc-tags/property'),
  require('../../lib/ngdoc-tags/requires'),
  require('../../lib/ngdoc-tags/returns'),
  require('../../lib/ngdoc-tags/default'),
];
var inlineTagHandlers = [
  require('../../lib/ngdoc-tags/inline/link'),
  require('../../lib/ngdoc-tags/inline/noop'),
];
var ngdocPlugins = [
  require('../../lib/ngdoc-plugins/calculate-id'),
  require('../../lib/ngdoc-plugins/calculate-section'),
  require('../../lib/ngdoc-plugins/calculate-path')
];

module.exports = {
  // File reading
  readFiles: fileReaderFactory(docExtractors),

  // Doc processing
  processDoc: ngDocProcessorFactory(ngdocTagHandlers, inlineTagHandlers, ngdocPlugins),

  // Doc collection processing
  mergeDocs: require('../../lib/doc-merger'),

};