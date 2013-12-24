var PROPERTY_REGEX = /^\{(\S+)\}\s+(\S+)(\s+(.*))?/;

module.exports = function(tagInfo) {
  var match;
  if (tagInfo.name === 'property') {
    match = PROPERTY_REGEX.exec(tagInfo.text);
    if (!match) {
      throw new Error("Not a valid 'property' format: " + tagInfo.text + ' (found in: ' + tagInfo.doc.file + ':' + tagInfo.startingLine + ')');
    }
    tagInfo.doc.properties = tagInfo.doc.properties || [];
    tagInfo.doc.properties.push({
      type: match[1],
      name: match[2],
      shortName: match[2],
      description: tagInfo.text.replace(match[0], match[4])
    });
    return true;
  }
};