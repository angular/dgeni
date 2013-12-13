var PROPERTY_REGEX = /^\{(\S+)\}\s+(\S+)(\s+(.*))?/;

module.exports = function(tag, doc) {
  var match;
  if (tag.name === 'property') {
    match = PROPERTY_REGEX.exec(tag.text);
    if (!match) {
      throw new Error("Not a valid 'property' format: " + tag.text + ' (found in: ' + doc.file + ':' + tag.startingLine + ')');
    }
    doc.properties = doc.properties || [];
    doc.properties.push({
      type: match[1],
      name: match[2],
      shortName: match[2],
      description: tag.text.replace(match[0], match[4])
    });
    return true;
  }
};