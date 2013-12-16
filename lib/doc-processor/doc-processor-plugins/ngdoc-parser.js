var _ = require('lodash');

/**
 * Create a doc-processor plugin to parse ngdoc tags in docs
 * @param  {function} parseDoc          The ngdoc parser
 * @return {function}                   The plugin function to parse a collection of docs
 */
module.exports = function(parseDoc) {
  return function parseDocs(docs) {
    _.forEach(docs, function(doc) {
      parseDoc(doc);
    });
    return docs;
  };
};