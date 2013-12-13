var trimIndentation = require('./utils/trim-indentation');
var NEW_LINE = /\n\r?/;
var NGDOC_TAG = /^\s*@(\w+)(\s+(.*))?/;
var INLINE_NGDOC_TAG = /\{@(\w+)\s*(.*)\s*\}/mg;

module.exports = function ngDocProcessorFactory(tagHandlers, inlineTagHandlers, plugins) {

  /**
   * Process any inline tags within the text of a normal (non-inline) tag
   * @param  {object} tagInfo Info about the tag to process
   * @param  {object} doc     Info about the doc being processed
   */
  function processInlineTags(tagInfo, doc) {
    tagInfo.text = tagInfo.text.replace(INLINE_NGDOC_TAG, function(_, tagName, otherStuff) {
      for (var i = 0, ii = inlineTagHandlers.length; i < ii; i++) {
        var result = inlineTagHandlers[i](doc, tagName, otherStuff);

        // If this handler returns something then use that in place of the inline tag
        if ( result !== undefined && result !== null ) {
          return result;
        }
      }
    });
  }

  /**
   * Process the tag by passing it to each of the handlers in turn
   * @param  {object} tagInfo Info about the tag to process
   * @param  {object} doc     Info about the doc being processed
   */
  function processTag(tagInfo, doc) {
    tagInfo.text = trimIndentation(tagInfo.lines.join('\n'));

    // We process any inline tags in the text before letting the normal tag handlers at it
    processInlineTags(tagInfo, doc);

    for (var i = 0, ii = tagHandlers.length; i < ii; i++) {
      if ( tagHandlers[i](tagInfo, doc) ) {
        break;
      }
    }
  }

  /**
   * Process the ngdoc tags in the document
   * @param  {object} doc The document to process - meta data will be added to this by the handlers
   */
  return function processDoc(doc) {
    var currentTag, line;

    // Run the plugins
    plugins.forEach(function(plugin) {
      plugin.before && plugin.before(doc);
    });

    doc.content.split(NEW_LINE).forEach(function(line){
      var match = line.match(NGDOC_TAG);
      if (match) { // we found a new tag!
        
        // in case we are in the middle of parsing a previous tag we process it now
        if ( currentTag ) {
          processTag(currentTag, doc, line);
        }

        // start a new tag
        currentTag = {
          name: match[1],
          lines: match[3] ? [match[3]] : []
        };
      } else if (currentTag) { // we didn't find a new tag but are in still parsing a previous one
        // add this line to the current tag
        currentTag.lines.push(line);
      }
    });

    // we got to the end of the file so process any outstanding tag
    if ( currentTag ) {
      processTag(currentTag, doc, line);
    }

    // Run the plugins
    plugins.forEach(function(plugin) {
      plugin.after && plugin.after(doc);
    });

  };
};