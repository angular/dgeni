var tags = require('../../../utils/tags');
module.exports.each = function(doc) {
  var nameTag = tags.getTag(doc.tags, 'name');
  if ( !nameTag ) {
    throw new Error('Missing "name" tag in ', doc);
  }
  doc.name = nameTag.description;
};
