var path = require('path');
var canonical = require('../../utils/canonical-path');

/**
 * Plugin that guesses the document id from other parts of the doc if it doesn't exist
 * @param  {object} doc The document we are working with
 * Adds the following properties to the doc:
 * ```
 * {
 *   path: '...'
 * }
 * ```
 * @param  {object} doc The document we are working with
 * @requires `doc` to have the following properties:
 * ```
 * {
 *   fileType: 'js',
 *   section: '...', // optional
 *   module: '...', // optional
 *   ngdoc: 'directive|filter|function|object|...',
 *   name: '...'
 * }
 * ```
 * or
 * ```
 * {
 *   fileType: '...',
 *   file: '...',
 * }
 * ```
 */
module.exports = {
  after: function idFromName(doc) {
    if ( doc.fileType === 'js' ) {
      var parts = [];
      if ( doc.section ) { parts.push(doc.section); }
      if ( doc.module ) { parts.push(doc.module); }
      if ( doc.ngdoc == 'directive' ) { parts.push('directive'); }
      if ( doc.ngdoc == 'filter' ) { parts.push('filter'); }
      if ( doc.ngdoc == 'function' || doc.ngdoc == 'object' ) { parts.push('global'); }
      parts.push(doc.name);
      doc.path = parts.join('/');
    } else {
      doc.path = canonical(path.dirname(doc.file) + '/' + path.basename(doc.file, '.' + doc.fileType));
    }
  }
};