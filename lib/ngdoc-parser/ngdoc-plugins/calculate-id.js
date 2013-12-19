var path = require('canonical-path');

/**
 * Plugin that guesses the document id from other parts of the doc if it doesn't exist
 * @param  {object} doc The document we are working with
 */
module.exports = {
  after: function idFromName(doc) {

    if ( doc.fileType === 'js' ) {

      var module = doc.module ? (doc.module + '.') : '';
      var type = (doc.ngdoc === 'directive' || doc.ngdoc === 'filter' || doc.ngdoc === 'global' ) ? doc.ngdoc + ':' : '';
    
      doc.id = doc.id || ('module:' + module + type + doc.name);

    } else {

      doc.id = doc.id || doc.name || path.basename(doc.file, '.' + doc.fileType);

    }
  }
};