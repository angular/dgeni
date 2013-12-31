var tags = require('../../../utils/tags');
var checkProperty = require('../../../utils/check-property');
var _ = require('lodash');

module.exports = {
  name: 'restrict',
  each: function(doc) {
    var restrictTag = tags.getTag(doc.tags, 'restrict');
    if ( !restrictTag ) {
      checkProperty(doc, 'componentType');
      if ( doc.componentType === 'directive') {
        // The doc is for a directive but no restrict has been specified.
        // The default is attribute
        doc.restrict = {
          element: false,
          attribute: true,
          cssClass: false,
          comment: false
        };
      }
    } else {
      doc.restrict = {
        element: _.contains(restrictTag.description, 'E'),
        attribute: _.contains(restrictTag.description, 'A'),
        cssClass: _.contains(restrictTag.description, 'C'),
        comment: _.contains(restrictTag.description, 'M')
      };
    }
  }
};