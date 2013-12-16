var _ = require('lodash');

module.exports = function checkLinks(docs) {
  var docMap = {};
  _.forEach(docs, function(doc) {
    docMap[doc.id] = doc;
  });

  _.forEach(docs, function(doc) {

  });
};