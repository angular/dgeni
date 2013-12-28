var _ = require('lodash');
var path = require('canonical-path');
var checkProperty = require('../../../utils/check-property');

module.exports.each = function(doc) {
  if ( doc.fileType === 'js' ) {
    checkProperty(doc, 'section');
    checkProperty(doc, 'module');
    checkProperty(doc, 'docType');

    // Build up the path segments
    var segments = [];

    // First the section
    segments.push(doc.section);

    // Next the module
    segments.push(doc.module);
    
    // Now the type of component (if it is relevant)
    switch(doc.docType) {
      case 'directive':
        segments.push('directive');
        break;
      case 'filter':
        segments.push('filter');
        break;
      case 'function':
      case 'object':
        segments.push('global');
        break;
    }

    // If it's a module then add index, otherwise the name of the component
    if ( doc.docType === 'module' ) {
      segments.push('index');
    } else {
      segments.push(doc.name);
    }
    
    // Finally join up with the .html extension
    doc.path = segments.join('/') + '.html';
  } else {
    
    // Replace the original extension with .html
    doc.path = path.dirname(doc.file) + '/' + path.basename(doc.file, '.' + doc.fileType) + '.html';
  }
};