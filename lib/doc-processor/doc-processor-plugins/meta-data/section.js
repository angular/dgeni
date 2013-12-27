var _ = require('lodash');
module.exports.each = function(doc) {
  // Take the section from the tag, or 'api' if js file, or from the file path
  var sectionTag = _.find(doc.tags, { title: 'section'});
  doc.section = sectionTag ? sectionTag.description :
                  ( doc.fileType === 'js' ? 'api' : path.dirname(doc.file).split('/').shift() );
};