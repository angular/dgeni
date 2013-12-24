var REQUIRES_REGEX = /^([^\s]*)\s*([\S\s]*)/;

module.exports = function(tagInfo) {
  var match;
  if (tagInfo.name === 'requires') {
    match = REQUIRES_REGEX.exec(tagInfo.text);
    tagInfo.doc.requires = tagInfo.doc.requires || [];
    tagInfo.doc.requires.push({
      name: match[1],
      text: match[2]
    });
    return true;
  }
};