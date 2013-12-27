var _ = require('lodash');
var path = require('canonical-path');
var checkMeta = require('./check-meta');
module.exports = {
  name: 'id',
  each: function(doc) {
    var idTag = _.find(doc.tags, { title: 'id'});
    if ( idTag ) {
      // Take the id from the tag
      doc.id = idTag.description;
    } else if ( doc.fileType === 'js' ) {
      checkMeta(doc, 'docType');
      checkMeta(doc, 'module');
      checkMeta(doc, 'name');
      // Calculate the id from the name, module and type if a js file
      var type = (doc.docType === 'directive' || doc.docType === 'filter' || doc.docType === 'global' ) ? doc.docType + ':' : '';
      doc.id = 'module:' + doc.module + '/' + type + doc.name;
    } else {
      // Otherwise use the document name if provided or the filename, stripped of its extension
      doc.id = doc.name || path.basename(doc.file, '.' + doc.fileType);
    }
  }
};