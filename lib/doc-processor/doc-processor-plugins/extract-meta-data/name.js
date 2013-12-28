var _ = require('lodash');
module.exports.each = function(doc) {
  var nameTag = _.find(doc.tags, { title: 'name'});
  if ( !nameTag ) {
    throw new Error('Missing "name" tag in ', doc);
  }
  doc.name = nameTag.description;
};
