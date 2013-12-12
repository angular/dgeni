var trimIndentation = require('../utils/trim-indentation');
var PlaceholderMap = require('../utils/placeholder-map');

module.exports = function(contentParsers) {
  return function(text, doc) {
    if (!text) return text;

    contentParsers = contentParsers || [];

    var placeholders = new PlaceholderMap();

    text = trimIndentation(text);
    contentParsers.forEach(function(contentParser) {
      text = parser(text, doc, placeholders);
    });

    return text;
  };
};