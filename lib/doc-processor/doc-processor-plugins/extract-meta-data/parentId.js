var _ = require('lodash');
var tags = require('../../../utils/tags');
var checkProperty = require('../../../utils/check-property');
var codeName = require('../../../utils/code-name');

module.exports = {
  name: 'parentId',

  each: function(doc) {
    checkProperty(doc, 'docType');
    // Explicitly set the parentId to '' initially to mark that we have at least processed
    // this property - see `id` processor plugin
    doc.parentId = '';

    _.forEach(['event', 'property', 'method'], function(childType) {
      if ( doc.docType == childType ) {
        var tag = tags.getTag(doc.tags, childType + 'Of');
        if ( !tag ) {
          throw new Error('Missing tag "' + childType + 'Of' + '" for doc of type "' + childType + '" in file "' + doc.file + '" at line ' + doc.startingLine);
        }
        doc.parentId = codeName.getAbsoluteCodeName(doc, tag.description);
      }
    });
  }
};
