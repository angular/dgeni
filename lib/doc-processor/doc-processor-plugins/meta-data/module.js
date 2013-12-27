var _ = require('lodash');
module.exports.each = function(doc) {
  // Take the module from the tag or the 2nd segment of the path if js file
  var moduleTag = _.find(doc.tags, { title: 'module'});
  console.log(doc.file);
  doc.module = moduleTag ? moduleTag.description : doc.fileType === 'js' && doc.file.split('/')[1];
};