var tags = require('../../../../lib/utils/tags');
var path = require('canonical-path');

module.exports.each = function(doc) {
  // Take the section from the tag, or 'api' if js file, or from the file path
  var sectionTag = tags.getTag(doc.tags, 'section');
  if ( sectionTag ) {
    // section tags trump other methods
    doc.section = sectionTag.description;
  } else if ( doc.fileType === 'js' ) {
    // Code files are put in the api section
    doc.section = 'api';
  } else {
    // Take the first path segment as the section name
    doc.section = path.dirname(doc.file).split('/').shift();
  }
};