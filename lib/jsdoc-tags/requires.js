var REQUIRES_REGEX = /^([^\s]*)\s*([\S\s]*)/;

module.exports = function(currentTag, doc, line, parseContent) {
  var match;
  if (currentTag.name === 'requires') {
    match = REQUIRES_REGEX.exec(text);
    doc.requires = doc.requires || [];
    doc.requires.push({
      name: match[1],
      text: parseContent(match[2])
    });
    return true;
  }
};