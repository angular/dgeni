var _ = require('lodash');
var path = require('canonical-path');

module.exports.each = function(doc) {
  if ( doc.fileType === 'js' ) {
    if ( !doc.section || !doc.module || !doc.docType ) {
      throw new Error('Meta data missing! The document needs section, module and docType.  Are you missing a plugin?');
    }
    var parts = [];
    parts.push(doc.section);
    parts.push(doc.module);
    switch(doc.docType) {
      case 'directive':
        parts.push('directive');
        break;
      case 'filter':
        parts.push('filter');
        break;
      case 'function':
      case 'object':
        parts.push('global');
        break;
    }

    if ( doc.docType === 'module' ) {
      parts.push('index');
    } else {
      parts.push(doc.name);
    }
    
    doc.path = parts.join('/') + '.html';
  } else {
    doc.path = path.dirname(doc.file) + '/' + path.basename(doc.file, '.' + doc.fileType) + '.html';
  }
};