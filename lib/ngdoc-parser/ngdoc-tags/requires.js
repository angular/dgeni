var REQUIRES_REGEX = /^([^\s]*)\s*([\S\s]*)/;

module.exports = function(tag, doc) {
  var match;
  if (tag.name === 'requires') {
    match = REQUIRES_REGEX.exec(tag.text);
    doc.requires = doc.requires || [];
    doc.requires.push({
      name: match[1],
      text: match[2]
    });
    return true;
  }
};