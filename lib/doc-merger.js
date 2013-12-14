/**
 * Merge child docs (i.e. methods, properties and events) into their parent docs
 * @param  {array} docs The collection of docs to merge
 * @return {array}      The collection of merged docs
 */
module.exports = function mergeDocs(docs) {
  var docMap = {};

  docs.forEach(function(doc) {
    docMap[doc.id] = doc;
  });

  var mergedDocs = [];
  docs.forEach(function(doc) {
    var parentDoc;
    if ( doc.methodOf ) {
      parentDoc = docMap[doc.methodOf];
      parentDoc.methods = parentDoc.methods || [];
      parentDoc.methods.push(doc);
    } else if ( doc.propertyOf ) {
      parentDoc = docMap[doc.propertyOf];
      parentDoc.properties = parentDoc.properties || [];
      parentDoc.properties.push(doc);
    } else if ( doc.eventOf ) {
      parentDoc = docMap[doc.eventOf];
      parentDoc.events = parentDoc.events || [];
      parentDoc.events.push(doc);
    } else {
      mergedDocs.push(doc);
    }
  });

  return mergedDocs;
};