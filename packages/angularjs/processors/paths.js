var path = require('canonical-path');
var checkProperty = require('../../../lib/utils/check-property');
var codeName = require('../../../lib/utils/code-name');

// 
module.exports = {
  name: 'paths',
  description: 'This plugin will compute the path to the route and the output file for the partial' +
               'that will be generated from the code name or original file path of the doc.',
  requires: ['doctrine-tag-extractor'],
  each: function(doc) {
    if ( doc.fileType === 'js' ) {

      checkProperty(doc, 'section');
      checkProperty(doc, 'id');

      var parts = codeName.getAbsCodeNameParts(doc, doc.id);

      doc.path = codeName.getCodePath(doc, parts);

      // Strip off any hash fragment...
      // If the parts don't contain a "name" then it is a module, in which case use index.html
      doc.outputPath = doc.path.split('#').shift() + (parts.name ? '.html' : '/index.html');

    } else {
      var relativeFilePath = path.relative(doc.basePath, doc.file);
      // Replace the original extension with .html
      doc.path = path.dirname(relativeFilePath) + '/' + path.basename(relativeFilePath, '.' + doc.fileType);
      doc.outputPath = doc.path + '.html';
    }
  }
};