var _ = require('lodash');
module.exports.each = function(doc) {
  var ngdocTag = _.find(doc.tags, { title: 'ngdoc'});
  if ( !ngdocTag ) {
    throw new Error('Missing "ngdoc" tag');
  }
  doc.docType = ngdocTag.description;
};