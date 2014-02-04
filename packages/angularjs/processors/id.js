var _ = require('lodash');
var path = require('canonical-path');
var checkProperty = require('../../../lib/utils/check-property');
var PartialNames = require('../../../lib/utils/partial-names').PartialNames;
var log = require('winston');

module.exports = {
  name: 'id',
  description: 'Compute the id of the document',
  runAfter: ['tags-extracted'],
  runBefore: ['processing-docs'],
  init: function(config, injectables) {
    injectables.value('partialNames', new PartialNames());
  },
  process: function(docs, partialNames) {
    _.forEach(docs, function(doc) {
      if ( doc.id ) return;

      if ( doc.fileType === 'js' ) {

        // The document was extracted from a js file so it is going to be code related
        // compute the id from the other properties

        if ( doc.docType === 'module' ) {

          checkProperty(doc, 'module');
          doc.id = 'module:' + doc.module;

        } else {

          checkProperty(doc, 'name');
          checkProperty(doc, 'docType');
          checkProperty(doc, 'module');
          doc.id = 'module:' + doc.module + '.' + doc.docType + ':' + doc.name;
        }

      } else {

        // use the filename, stripped of its extension
        checkProperty(doc, 'file');
        checkProperty(doc, 'fileType');

        doc.id = doc.fileName;
        if ( doc.id === 'index' ) {
          doc.id = path.dirname(doc.file);
        }
      }

      log.debug('Identified document: ', doc.id);

      // Store this doc in the partial names store for looking up by partial names later
      partialNames.addDoc(doc);
    });
  }
};