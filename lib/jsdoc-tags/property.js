var parseContent = require('../parse-content');
var PROPERTY_REGEX = /^\{(\S+)\}\s+(\S+)(\s+(.*))?/;

module.exports = function(currentTag, doc, line, parseContent) {
  var match;
  if (currentTag.name === 'property') {
    match = PROPERTY_REGEX.exec(text);
    if (!match) {
      throw new Error("Not a valid 'property' format: " + text + ' (found in: ' + doc.file + ':' + line + ')');
    }
    doc.properties = doc.properties || [];
    doc.properties.push({
      type: match[1],
      name: match[2],
      shortName: match[2],
      description: parseContent(text.replace(match[0], match[4]))
    });
    return true;
  }
};