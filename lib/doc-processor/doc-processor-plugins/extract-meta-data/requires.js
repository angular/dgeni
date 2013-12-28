var _ = require('lodash');
var codeName = require('../../../utils/code-name');
var checkProperty = require('../../../utils/check-property');

module.exports = {
  name: 'requires',
  each: function(doc) {
    var requiresTags = _.where(doc.tags, { title: 'requires'});
    doc.requires = doc.requires || [];
    _.forEach(requiresTags, function(requiresTag) {
      doc.requires = codeName.getAbsoluteCodeName(requiresTag.description);
    });
  }
};