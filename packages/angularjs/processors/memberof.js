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
  name: 'memberof',
  runAfter: ['id'],

  description: 'Move child docs (e.g. events, methods or properties) into the parent doc',

  process: function mergeChildDocs(docs, partialNames) {

    var mergedDocs = [];

    _.forEach(docs, function(doc) {

      var isChild = false;

      checkProperty(doc, 'id');

      _.forEach(mergeableTypes, function(collectionProp, referenceType) {
        var parentDoc;

        if ( doc.docType === referenceType ) {
          log.debug('child doc found', doc.id);
          isChild = true;

          parentDoc = partialNames.getLink(doc.memberof);
          if ( !parentDoc ) {
            log.warn('Missing parent document "'+ doc.memberof + '" referenced by "'+ doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine);
            return;
          }
          if ( _.isArray(parentDoc) ) {
            log.warn('Ambiguous parent document reference "'+ doc.memberof + '" referenced by "'+ doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine);
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