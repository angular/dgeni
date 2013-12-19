var path = require('canonical-path');
/**
 * Plugin that guesses the document section from other parts of the doc if it doesn't exist
 * Adds the following properties to the doc:
 * ```
 * {
 *   section: '...'
 * }
 * ```
 * @param  {object} doc The document we are working with
 * @requires `doc` to have the following properties:
 * ```
 * {
 *   fileType: '...',
 *   file: '...'
 * }
 * ```
 */
module.exports = {
  after: function calculateSection(doc) {
    if ( !doc.section ) {
      if ( doc.fileType === 'js' ) {
        doc.section = 'api';
      } else {
        doc.section = path.dirname(doc.file).split('/').shift();
      }
    }
  }
};