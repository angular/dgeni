var path = require('path');

/**
 * Plugin that guesses the module from the filename if it doesn't exist already
 * Adds the following properties to the doc:
 * ```
 * {
 *   module: '...'
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
  after: function calculateModule(doc) {
    if ( !doc.module ) {
      if ( doc.fileType === 'js' ) {
        doc.module = doc.file.split(path.sep).shift();
      }
    }
  }
};