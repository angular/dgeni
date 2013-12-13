var path = require('path');
var canonical = require('../utils/canonical-path');

/**
 * Plugin that guesses the document id from other parts of the doc if it doesn't exist
 * @param  {object} doc The document we are working with
 */
module.exports = {
  after: function idFromName(doc) {
    if ( doc.fileType === 'ngdoc' ) {
      doc.path = canonical(path.dirname(doc.file) + '/' + path.basename(doc.file, '.' + doc.fileType));
    }
    if ( doc.fileType === 'js' ) {
      var parts = [];
      if ( doc.module ) { parts.push(doc.module); }
      if ( doc.ngdoc == 'directive' ) { parts.push(directive); }
      if ( doc.ngdoc == 'filter' ) { parts.push(filter); }
      parts.push(doc.name);
      doc.path = parts.join('/');
    }
  }
};