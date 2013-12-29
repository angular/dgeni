var _ = require('lodash');
var tags = require('../../../utils/tags');
var codeName = require('../../../utils/code-name');
var checkProperty = require('../../../utils/check-property');

module.exports = {
  name: 'requires',
  each: function(doc) {
    var requiresTags = tags.getTags(doc.tags, 'requires');
    doc.requires = doc.requires || [];
    _.forEach(requiresTags, function(requiresTag) {
      doc.requires.push(codeName.getAbsoluteCodeName(doc, requiresTag.description));
    });
  }
};