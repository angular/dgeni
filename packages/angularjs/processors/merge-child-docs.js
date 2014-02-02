var _ = require('lodash');
var checkProperty = require('../../../lib/utils/check-property');
var log = require('winston');

var mergeableTypes = {
  method: 'methods',
  property: 'properties',
  event: 'events'
};

/**
 * Merge child docs (i.e. methods, properties and events) into their parent docs
 * @param  {array} docs The collection of docs to merge
 * @return {array}      The collection of merged docs
 */
module.exports = {
  name: 'merge-child-docs',
  runAfter: ['tags-extracted'],

  description: 'Move child docs (e.g. events, methods or properties) into the parent doc',

  after: function mergeChildDocs(docs) {

    var parentDoc;
    var mergedDocs = [];
    var docMap = {};

    _.forEach(docs, function(doc) {
      docMap[doc.id] = doc;
    });

    _.forEach(docs, function(doc) {

      checkProperty(doc, 'id');

      var isChild = false;
      _.forEach(mergeableTypes, function(collectionProp, referenceType) {

        if ( doc.docType === referenceType ) {
          log.debug('child doc found', doc.id);
          isChild = true;

          parentDoc = docMap[doc.memberof];
          if ( !parentDoc ) {
            log.warn('Missing parent document "'+ doc.memberof + '" referenced by "'+ doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine);
            return;
          }
          parentDoc[collectionProp] = parentDoc[collectionProp] || [];
          parentDoc[collectionProp].push(doc);
          parentDoc[collectionProp] = _.sortBy(parentDoc[collectionProp], 'name');
        }
      });

      if ( !isChild ) {
        mergedDocs.push(doc);
      }
    });

    return mergedDocs;
  }
};