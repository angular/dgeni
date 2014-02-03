var _ = require('lodash');
var path = require('canonical-path');
var checkProperty = require('../../../lib/utils/check-property');
var codeName = require('../../../lib/utils/code-name');

module.exports = {
  name: 'id',
  description: 'Compute the id of the document',
  runAfter: ['tags-extracted'],
  runBefore: ['processing-docs'],
  init: function(config, injectables) {
    injectables.value('partialNames', new codeName.PartialNames());
  },
  process: function(docs, partialNames) {
    _.forEach(docs, function(doc) {
      if ( doc.id ) return;

      if ( doc.fileType === 'js' ) {

        // The document was extracted from a js file so it is going to be code related
        // compute the id from the other properties
        checkProperty(doc, 'name');

        if ( doc.memberof ) {
          doc.id = doc.memberof + '#' + doc.name;
        } else if ( doc.docType === 'module' ) {
          checkProperty(doc, 'module');
          doc.id = 'module:' + doc.module;
        } else {
          checkProperty(doc, 'docType');
          checkProperty(doc, 'module');
          doc.id = 'module:' + doc.module + '.' + doc.docType + ':' + doc.name;
        }
      } else {
        // use the document name if provided or the filename, stripped of its extension
        doc.id = doc.name || path.basename(doc.file, '.' + doc.fileType);
      }

      partialNames.addDoc(doc);
    });
  }
};