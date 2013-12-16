var _ = require('lodash');
var forEachRecursive = require('../../utils/for-each-recursive');

module.exports = function checkLinks(docs) {
  var docMap = {};
  _.forEach(docs, function(doc) {
    docMap[doc.id] = doc;
  });

  _.forEach(docs, function(doc) {
    forEachRecursive(doc, function(property, key) {
      if ( key === 'links' && _.isArray(property) ) {
        _.forEach(property, function(link) {
          if ( !docMap[link] ) {
            console.log('ERROR: invalid link, "' + link + '" in doc "' + doc.id + '"');
          }
        });
      }
      return property;
    });
  });
};