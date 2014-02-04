var _ = require('lodash');
var partialNames = require('../../../lib/utils/partial-names');

module.exports = {
  name: 'parent',
  description: 'Compute the parent document for each document',
  runAfter: ['extra-docs-added'],
  runBefore: ['rendering-docs'],
  init: function(config, injectables) {
    injectables.value('topLevelDocs', {});
  },
  process: function(docs, partialNames, topLevelDocs) {
    _.forEach(docs, function(doc) {
      if ( !doc.parent ) {

        // Compute this doc's parent
        var parentId;
        if ( doc.docType === 'componentGroup') {
          parentId = doc.id.slice(0, -doc.groupType.length-1);
        } else {
          parentId = doc.id.slice(0, doc.id.lastIndexOf(doc.docType) + doc.docType.length);
        }

        if ( parentId == doc.id ) {

          // This page is top level so record it and bail out
          topLevelDocs[doc.id] = doc;
          return;

        }

        doc.parent = parentId;
      }

      doc.parentDoc = partialNames.getDoc(doc.parent);

      if ( _.isArray(doc.parentDoc) ) {
        throw new Error('Ambiguous parent id "' + doc.parent + '" for doc "' + doc.id + '". Possible parents are: ' +
          '"' + _.pluck(doc.parentDoc, 'id').join('", "') + '"'
        );
      }

      if ( !doc.parentDoc ) {
        throw new Error('Invalid parent id "' + doc.parent + '"');
      }

      // Wire up the childDocs property to link back down from the parent
      doc.parentDoc.childDocs = doc.parentDoc.childDocs || [];
      doc.parentDoc.childDocs.push(doc);

    });
  }
};