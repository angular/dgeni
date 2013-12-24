var RETURN_REGEX = /^\{([^}]+)\}\s+(.*)/;

module.exports = function(tagInfo) {
  var match;
  if (tagInfo.name === 'returns' || tagInfo.name === 'return') {
    match = RETURN_REGEX.exec(tagInfo.text);
    if (!match) {
      throw new Error("Not a valid 'returns' format: " + tagInfo.text + ' (found in: ' + tagInfo.doc.file + ':' + tagInfo.startingLine + ')');
    }
    tagInfo.doc.returns = {
      type: match[1],
      description: tagInfo.text.replace(match[0], match[2])
    };
    return true;
  }
};