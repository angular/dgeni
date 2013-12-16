var EVENTTYPE_REGEX = /^([^\s]*)\s+on\s+([\S\s]*)/;

module.exports = function(tag, doc) {
  var match;
  if (tag.name === 'eventType') {
    match = EVENTTYPE_REGEX.exec(tag.text);
    doc.eventType = match[1];
    doc.eventTarget = match[2];
    return true;      
  }
};