var RETURN_REGEX = /^\{([^}]+)\}\s+(.*)/;

module.exports = function(tag, doc) {
  var match;
  if (tag.name === 'returns' || tag.name === 'return') {
    match = RETURN_REGEX.exec(tag.text);
    if (!match) {
      throw new Error("Not a valid 'returns' format: " + tag.text + ' (found in: ' + doc.file + ':' + tag.startingLine + ')');
    }
    doc.returns = {
      type: match[1],
      description: tag.text.replace(match[0], match[2])
    };
    return true;
  }
};