var path = require('canonical-path');
var checkProperty = require('../../utils/check-property');
var codeName = require('../../utils/code-name');

module.exports = {
  name: 'compute-path',
  each: function(doc) {
    if ( doc.fileType === 'js' ) {

      checkProperty(doc, 'section');
      checkProperty(doc, 'id');

      var parts = codeName.getAbsCodeNameParts(doc, doc.id);

      doc.path = codeName.getCodePath(doc, parts);
      doc.filePath = doc.path + (parts.name ? '.html' : '/index.html');

    } else {
      // Replace the original extension with .html
      doc.path = '/' + path.dirname(doc.file) + '/' + path.basename(doc.file, '.' + doc.fileType);
      doc.filePath = doc.path + '.html';
    }
  }
};