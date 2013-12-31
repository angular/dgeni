var tags = require('../../../utils/tags');
var _ = require('lodash');
var doctrine = require('doctrine');

module.exports = {
  name: 'param',
  each: function(doc) {
    var paramTags = tags.getTags(doc.tags, 'param');
    _.forEach(paramTags, function(paramTag) {
      doc.params = doc.params || [];
      doc.params.push({
        name: paramTag.name,
        description: paramTag.description,
        type: doctrine.type.stringify(paramTag.type),
        optional: paramTag.type.type === 'OptionalType',
        default: paramTag.default
      });
    });
  }
};
