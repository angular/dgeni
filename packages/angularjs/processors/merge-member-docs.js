var _ = require('lodash');
var checkProperty = require('../../../lib/utils/check-property');
var log = require('winston');

var mergeableTypes = {
  method: 'methods',
  property: 'properties',
  event: 'events'
};

/**
 * Merge child docs (i.e. methods, properties and events) into their container docs
 * @param  {array} docs The collection of docs to merge
 * @return {array}      The collection of merged docs
 */
module.exports = {
  name: 'merge-member-docs',
  runAfter: ['id'],

  description: 'Merge member docs (e.g. events, methods or properties) into the container doc',

  process: function(docs, partialNames) {

    var mergedDocs = [];

    _.forEach(docs, function(doc) {

      var isChild = false;

      checkProperty(doc, 'id');

      _.forEach(mergeableTypes, function(containerProperty, memberDocType) {
        var containerDoc;

        if ( doc.docType === memberDocType ) {
          log.debug('child doc found', doc.id);
          isChild = true;

          var parts = doc.id.split('#');
          if ( parts.length > 1 ) {
            doc.memberof = parts[0];
            doc.id = parts[1];
          }

          containerDoc = partialNames.getDoc(doc.memberof);

          if ( !containerDoc ) {
            log.warn('Missing container document "'+ doc.memberof + '" referenced by "'+ doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine);
            return;
          }
          if ( _.isArray(containerDoc) ) {
            log.warn('Ambiguous container document reference "'+ doc.memberof + '" referenced by "'+ doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine);
            return;
          }

          var container = containerDoc[containerProperty] = containerDoc[containerProperty] || [];
          container.push(doc);
          containerDoc[containerProperty] = _.sortBy(container, 'id');
        }
      });

      if ( !isChild ) {
        mergedDocs.push(doc);
      }
    });

    return mergedDocs;
  }
};