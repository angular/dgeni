var marked = require('marked');
var trim = require('../utils/trim-indentation');
var placeholderMap = require('../utils/placeholder-map');

// TODO: generate this splitter from the parsers
var PARTS_SPLITTER = /(<pre.*?>[\s\S]*?<\/pre>|<doc:example(\S*).*?>[\s\S]*?<\/doc:example>|<example[^>]*>[\s\S]*?<\/example>)/;

function parseMarkdown(text, doc, parsers) {
  if (!text) return text;

  parsers = parsers || [];

  placeholderMap.init(doc);

  var parts = trim(text).split(PARTS_SPLITTER);
  parts.forEach(function(text, i) {
    text = text || '';
    // Apply each of the parsers to the text
    parsers.forEach(function(parser) {
      text = parser(text, doc);
    });
    parts[i] = text;
  });
  text = parts.join('');

  // Actually process the markdown and wrap in a div
  text = '<div class="' + doc.pageClassName + '">' + marked(text) + '</div>';

  // replace any text blocks that were extracted by a parser
  text = text.replace(/(?:<p>)?(REPLACEME\d+)(?:<\/p>)?/g, function(_, id) {
    return placeholderMap.get(doc, id);
  });

  return text;
}

module.exports = parseMarkdown;