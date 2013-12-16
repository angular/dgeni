var _ = require('lodash');
var trimIndentation = require('../utils/trim-indentation');
var NEW_LINE = /\n\r?/;
var NGDOC_TAG = /^\s*@(\w+)(\s+(.*))?/;
var INLINE_NGDOC_TAG = /\{@(\w+)\s*(.*?)\s*\}/mg;

module.exports = function ngDocProcessorFactory(tagHandlers, inlineTagHandlers, plugins) {

  /**
   * process the inline tags in each of the properties of the document, recursively
   * @param  {object} doc      The document we are working on
   * @param  {*} property The current property of the document we are working on
   * @return {*}          The new value for this property
   */
  function processInlineTagsInProperty(doc, property) {
    if ( _.isArray(property) || _.isObject(property) ) {
      _.forEach(_.keys(property), function(key) {
        property[key] = processInlineTagsInProperty(doc, property[key]);
      });
      return property;
    } else if (_.isString(property)) {
      return processInlineTags(doc, property);
    } else {
      return property;
    }
  }

  /**
   * Process any inline tags within the text of a normal (non-inline) tag
   * @param  {object} tagInfo Info about the tag to process
   * @param  {object} doc     Info about the doc being processed
   */
  function processInlineTags(doc, text) {
    return text.replace(INLINE_NGDOC_TAG, function(_, tagName, otherStuff) {
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
  function processTag(doc, tagInfo) {
    tagInfo.text = trimIndentation(tagInfo.lines.join('\n'));

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
      if ( _.isFunction(plugin.before) ) {
        plugin.before(doc);
      }
    });

    doc.content.split(NEW_LINE).forEach(function(line){
      var match = line.match(NGDOC_TAG);
      if (match) { // we found a new tag!
        
        // in case we are in the middle of parsing a previous tag we process it now
        if ( _.isPlainObject(currentTag) ) {
          processTag(doc, currentTag);
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
    if ( _.isPlainObject(currentTag) ) {
      processTag(doc, currentTag);
    }

    // Run the plugins
    plugins.forEach(function(plugin) {
      if ( _.isFunction(plugin.after) ) {
        plugin.after(doc);
      }
    });

    // We process the inline tags at the end so that they can make use of extra meta-data
    // in the doc that may have been extracted by the plugins and tag handlers.
    processInlineTagsInProperty(doc, doc);

    return doc;
  };
};