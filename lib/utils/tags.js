var _ = require('lodash');
var doctrine = require('doctrine');

module.exports = {
  getTag: function(tags, name) {
    return _.find(tags, { title: name});
  },
  getTags: function(tags, name) {
    return _.where(tags, { title: name});
  },
  getType: function(tag) {
    var isOptional = tag.type.type === 'OptionalType';
    var mainType = isOptional ? tag.type.expression : tag.type;
    var isUnion = mainType.type === 'UnionType';
    var subTypes;
    if ( isUnion ) {
      subTypes = _.map(mainType.elements, function(element) {
        return doctrine.type.stringify(element);
      });
    }

    return {
      description: doctrine.type.stringify(mainType),
      optional: isOptional,
      subTypes: subTypes
    };
  }
};