var path = require('canonical-path');
var tags = require('../../../utils/tags');
var checkProperty = require('../../../utils/check-property');
module.exports = {
  name: 'id',
  each: function(doc) {
    var idTag = tags.getTag(doc.tags, 'id');
    if ( idTag ) {
      // Take the id from the tag
      doc.id = idTag.description;
    } else if ( doc.fileType === 'js' ) {
      checkProperty(doc, 'componentType');
      checkProperty(doc, 'module');
      checkProperty(doc, 'name');
      checkProperty(doc, 'parentId');

      if ( doc.parentId ) {
        doc.id = doc.parentId + '#' + doc.name;
      } else {
        // Calculate the id from the name, module and type if a js file
        var type = doc.componentType ? (doc.componentType + ':') : '';
        doc.id = 'module:' + doc.module + '.' + type + doc.name;
      }
    } else {
      // Otherwise use the document name if provided or the filename, stripped of its extension
      doc.id = doc.name || path.basename(doc.file, '.' + doc.fileType);
    }
  }
};