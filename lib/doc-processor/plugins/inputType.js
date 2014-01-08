var INPUT_TYPE = /input\[(.+)\]/;
var checkProperty = require('../../utils/check-property');

module.exports = {
  name: 'input-type',
  each: function(doc) {
    if ( doc.docType === 'input' ) {

      checkProperty(doc, 'name');
      doc.inputType = INPUT_TYPE.exec(doc.name)[1];
    }
  }
};