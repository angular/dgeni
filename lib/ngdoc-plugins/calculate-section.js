var path = require('path');
/**
 * Plugin that guesses the document section from other parts of the doc if it doesn't exist
 * @param  {object} doc The document we are working with
 */
module.exports = {
  after: function calculateSection(doc) {
    if ( doc.fileType === 'ngdoc' ) {
      doc.section = doc.section || path.dirname(doc.file).split(path.sep).shift();
    }
    if ( doc.fileType === 'js' ) {
      doc.section = doc.section || 'api';
    }
  }
};