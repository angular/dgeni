var tags = require('../../../utils/tags');
var _ = require('lodash');

module.exports = {
  name: 'property',
  each: function(doc) {
    var propertyTags = tags.getTags(doc.tags, 'property');
    _.forEach(propertyTags, function(propertyTag) {
      doc.properties = doc.properties || [];
      doc.properties.push({
        type: propertyTag.type.name,
        name: propertyTag.name,
        description: propertyTag.description
      });
    });
  }
};