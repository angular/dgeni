var _ = require('lodash');
module.exports.each = function(doc) {
  var nameTag = _.find(doc.tags, { title: 'name'});
  doc.name = nameTag ? nameTag.description : '';
};
