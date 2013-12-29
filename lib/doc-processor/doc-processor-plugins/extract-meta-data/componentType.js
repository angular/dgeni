var checkProperty = require('../../../utils/check-property');

module.exports = {
  name: 'componentType',
  each: function(doc) {
    checkProperty(doc, 'docType');
    switch(doc.docType) {
      case 'directive':
      case 'input':
       doc.componentType = 'directive';
       break;
      case 'filter':
        doc.componentType = 'filter';
        break;
      case 'object':
      case 'function':
        doc.componentType = 'global';
        break;
      default:
        doc.componentType = '';
        break;
    }
  }
};
