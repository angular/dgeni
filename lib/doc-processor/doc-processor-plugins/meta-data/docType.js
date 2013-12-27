var _ = require('lodash');
module.exports.each = function(doc) {
  var ngdocTag = _.find(doc.tags, { title: 'ngdoc'});
  doc.docType = ngdocTag ? ngdocTag.description : '';
};