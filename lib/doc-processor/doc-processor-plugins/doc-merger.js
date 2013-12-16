var _ = require('lodash');
/**
 * Merge child docs (i.e. methods, properties and events) into their parent docs
 * @param  {array} docs The collection of docs to merge
 * @return {array}      The collection of merged docs
 */
module.exports = function mergeDocs(docs) {
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

      if ( doc.ngdoc === referenceType ) {
        isChild = true;

        var parts = doc.id.split('#');
        if ( parts.length != 2 ) {
          throw new Error('invalid ' + referenceType + ' id: ' + doc.id);
        }

        parentDoc = docMap[parts[0]];
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
};