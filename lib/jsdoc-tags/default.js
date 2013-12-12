module.exports = function(currentTag, doc, line, parseContent) {
  doc[currentTag.name] = parseContent(currentTag.text);
  return true;
};