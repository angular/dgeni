var EVENTTYPE_REGEX = /^([^\s]*)\s+on\s+([\S\s]*)/;

module.exports = function(currentTag, doc, line, parseContent) {
  var match;
  if (currentTag.name === 'eventType') {
    match = EVENTTYPE_REGEX.exec(text);
    doc.eventType = match[1];
    doc.eventTarget = match[2];
    return true;      
  }
};