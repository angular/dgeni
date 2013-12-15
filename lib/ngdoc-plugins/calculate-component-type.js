var COMPONENT_TYPE_REGEX = /^(directive|filter|error|module|global)$/;
/**
 * Plugin that guesses the document id from other parts of the doc if it doesn't exist
 * @param  {object} doc The document we are working with
 */
module.exports = {
  after: function idFromName(doc) {
    if ( doc.componentType ) return;

    if ( doc.fileType === 'js' && COMPONENT_TYPE_REGEX.test(doc.ngdoc) ) {
      doc.componentType = doc.ngdoc;
    }
  }
};