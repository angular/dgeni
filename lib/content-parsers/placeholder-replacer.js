/**
 * Replace any placeholders that were extracted by a previous parser
 */
module.exports = function(text, doc, placeholders) {
  return text.replace(/(?:<p>)?(REPLACEME\d+)(?:<\/p>)?/g, function(_, id) {
    return placeholders.get(id);
  });
};