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
  var mergeableProps = {
    methodOf: 'methods',
    propertyOf: 'properties',
    eventOf: 'events'
  };

  _.forEach(docs, function(doc) {
    docMap[doc.id] = doc;
  });

  _.forEach(docs, function(doc) {
    var isChild = false;
    _.forEach(mergeableProps, function(collectionProp, referenceProp) {

      if ( doc[referenceProp] ) {
        isChild = true;
        parentDoc = docMap[doc[referenceProp]];
        if ( !parentDoc ) {
          console.log('Missing parent document "'+ doc[referenceProp]+ '" referenced by '+ doc.id);
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