var _ = require('lodash');
/**
 * Merge child docs (i.e. methods, properties and events) into their parent docs
 * @param  {array} docs The collection of docs to merge
 * @return {array}      The collection of merged docs
 */
module.exports = {
  name: 'merge-child-docs',
  description: 'Move child docs (e.g. events, methods or properties) into the parent doc',
  after: function mergeChildDocs(docs) {
    console.log('after', docs.length);
    var parentDoc;
    var mergedDocs = [];
    var docMap = {};
    var mergeableTypes = {
      method: 'methods',
      property: 'properties',
      event: 'events'
    };

    _.forEach(docs, function(doc) {
      docMap[doc.id] = doc;
    });

    _.forEach(docs, function(doc) {
      var isChild = false;
      _.forEach(mergeableTypes, function(collectionProp, referenceType) {

        if ( doc.docType === referenceType ) {
          console.log('child doc found', doc.id);
          isChild = true;

          parentDoc = docMap[doc.parentId];
          if ( !parentDoc ) {
            console.log('Missing parent document "'+ parts[0] + '" referenced by '+ doc.id);
            return;
          }
          parentDoc[collectionProp] = parentDoc[collectionProp] || [];
          parentDoc[collectionProp].push(doc);
        }
      });

      if ( !isChild ) {
        mergedDocs.push(doc);
      }
    });

    return mergedDocs;
  }
};