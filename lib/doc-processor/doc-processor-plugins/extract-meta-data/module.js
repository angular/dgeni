var tags = require('../../../utils/tags');
var checkProperty = require('../../../utils/check-property');

module.exports.each = function(doc) {
  // Take the module from the tag or the 2nd segment of the path, if it is a js file
  var moduleTag = tags.getTag(doc.tags, 'module');
  if ( moduleTag ) {
    doc.module = moduleTag.description;
  } else if ( doc.fileType === 'js' ) {
    checkProperty(doc, 'file');
    doc.module = doc.file.split('/')[1];
  }
};