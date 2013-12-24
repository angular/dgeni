var EVENTTYPE_REGEX = /^([^\s]*)\s+on\s+([\S\s]*)/;

module.exports = function(tagInfo) {
  var match;
  if (tagInfo.name === 'eventType') {
    match = EVENTTYPE_REGEX.exec(tagInfo.text);
    tagInfo.doc.eventType = match[1];
    tagInfo.doc.eventTarget = match[2];
    return true;      
  }
};