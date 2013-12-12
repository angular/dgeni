var RETURN_REGEX = /^\{([^}]+)\}\s+(.*)/;

module.exports = function(currentTag, doc, line, parseContent) {
  var match;
  if (currentTag.name === 'returns' || currentTag.name === 'return') {
    match = RETURN_REGEX.exec(text);
    if (!match) {
      throw new Error("Not a valid 'returns' format: " + text + ' (found in: ' + doc.file + ':' + line + ')');
    }
    doc.returns = {
      type: match[1],
      description: parseContent(text.replace(match[0], match[2]))
    };
    return true;
  }
};