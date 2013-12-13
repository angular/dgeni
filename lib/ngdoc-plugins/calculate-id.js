var path = require('path');

/**
 * Plugin that guesses the document id from other parts of the doc if it doesn't exist
 * @param  {object} doc The document we are working with
 */
module.exports = {
  after: function idFromName(doc) {
    doc.id = doc.id || doc.name || path.basename(doc.file, '.'+doc.fileType);
  }
};