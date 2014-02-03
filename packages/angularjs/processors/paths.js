var _ = require('lodash');
var path = require('canonical-path');
var checkProperty = require('../../../lib/utils/check-property');
var codeName = require('../../../lib/utils/code-name');

module.exports = {
  name: 'paths',
  description: 'This plugin will compute the path to the route and the output file for the partial' +
               'that will be generated from the code name or original file path of the doc.',
  runAfter: ['processing-docs', 'id'],
  runBefore: ['docs-processed'],
  init: function(config, injectables) {
    injectables.value('partialFolder', (config && config.rendering && config.rendering.partialFolder) || 'partials');
  },
  process: function(docs, partialFolder) {
    _.forEach(docs, function(doc) {
      if ( doc.fileType === 'js' ) {

        checkProperty(doc, 'area');
        checkProperty(doc, 'id');

        var parts = codeName.getAbsCodeNameParts(doc, doc.id);

        doc.path = codeName.getCodePath(doc, parts);

        // Strip off any hash fragment...
        // If the parts don't contain a "name" then it is a module, in which case use index.html
        doc.outputPath = partialFolder + '/' + doc.path.split('#').shift() + (parts.name ? '.html' : '/index.html');

      } else {
        var folderName = path.dirname(doc.file);
        var fileName = path.basename(doc.file, '.' + doc.fileType);
        if ( fileName === 'index' ) {
          // Don't include "index" on the end of the path
          doc.path = folderName;
          doc.outputPath = partialFolder + '/' + doc.path + '/index.html';
        } else {
          doc.path = folderName + '/' + fileName;
          doc.outputPath = partialFolder + '/' + folderName + '/' + fileName + '.html';
        }
      }
    });
  }
};