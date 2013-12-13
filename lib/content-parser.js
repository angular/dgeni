var trimIndentation = require('./utils/trim-indentation');
var PlaceholderMap = require('./utils/placeholder-map');

/**
 * create a function that can parse text content
 * @param  {array<function>} contentParsers a collection of parsers that will be applied to the content
 * @return {string}                         the parsed content
 */
module.exports = function(contentParsers) {
  return function(text, doc) {
    if (!text) return text;

    contentParsers = contentParsers || [];

    var placeholders = new PlaceholderMap();

    text = trimIndentation(text);
    contentParsers.forEach(function(contentParser) {
      text = contentParser(text, doc, placeholders);
    });

    return text;
  };
};