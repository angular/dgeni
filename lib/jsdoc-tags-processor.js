var trimIndentation = require('../utils/trim-indentation');
var NEW_LINE = /\n\r?/;
var JSDOC_TAG = /^\s*@(\w+)(\s+(.*))?/;

module.exports = function jsDocTagProcessorFactory(tagHandlers, parseContent) {

  /**
   * Process the tag by passing it to each of the handlers in turn
   */
  function processTag(currentTag, doc, line) {
    currentTag.text = trimIndentation(currentTag.text.join('\n'));
    for (var i = 0, ii = tagHandlers.length; i < ii; i++) {
      if ( tagHandlers[i](currentTag, doc, line, parseContent) ) {
        break;
      }
    }
  }

  /**
   * Process the jsdoc tags in the document
   * @param  {object} doc The document to process - meta data will be added to this by the handlers
   */
  return function processJsDocTags(doc) {
    doc.content.split(NEW_LINE).forEach(function(line){
      var match = line.match(JSDOC_TAG);
      if (match) { // we found a new tag!
        // in case we are in the middle of parsing a previous tag we process it now
        if ( currentTag ) {
          processTag(currentTag, doc, line);
        }
        // start a new tag
        currentTag = {
          name: match[1],
          text: match[3] ? [match[3]] : []
        };
      } else if (currentTag) { // we didn't find a new tag but are in still parsing a previous one
        // add this line to the current tag
        currentTag.text.push(line);
      }
    });

    // we got to the end of the file so process any outstanding tag
    processTag(currentTag, doc, line);
  };
};