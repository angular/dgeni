var tags = require('../../../utils/tags');
module.exports.each = function(doc) {
  var ngdocTag = tags.getTag(doc.tags, 'ngdoc');
  if ( !ngdocTag ) {
    throw new Error('Missing "ngdoc" tag');
  }
  doc.docType = ngdocTag.description;
};