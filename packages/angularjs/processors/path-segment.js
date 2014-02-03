var _ = require('lodash');
var checkProperty = require('../../../lib/utils/check-property');

module.exports = {
  name: 'path-segment',
  description: 'Compute this documents segment of the path',
  runAfter: 'tags-extracted',
  process: function(docs) {
    _.forEach(docs, function(doc) {
      if ( doc.pathSegment ) return;

      if ( doc.fileType === 'js' ) {
        checkProperty(doc, 'name');
        doc.pathSegment = doc.name;
      } else {
        checkProperty(doc, 'file');
        doc.pathSegment = doc.file;
      }
    });
  }
};