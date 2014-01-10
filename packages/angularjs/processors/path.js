var path = require('canonical-path');
var checkProperty = require('../../../lib/utils/check-property');
var codeName = require('../../../lib/utils/code-name');

// This plugin will compute the path to the partial that will be generated
// from the code name or original file path of the doc.
module.exports = {
  name: 'compute-path',
  each: function(doc) {
    if ( doc.fileType === 'js' ) {

      checkProperty(doc, 'section');
      checkProperty(doc, 'id');

      var parts = codeName.getAbsCodeNameParts(doc, doc.id);

      doc.path = codeName.getCodePath(doc, parts);

      // If the parts don't contain a "name" then it is a module, in which case use index.html
      doc.filePath = doc.path + (parts.name ? '.html' : '/index.html');

    } else {
      // Replace the original extension with .html
      doc.path = path.dirname(doc.file) + '/' + path.basename(doc.file, '.' + doc.fileType);
      doc.filePath = doc.path + '.html';
    }
  }
};