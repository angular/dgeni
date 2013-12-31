var EVENTTYPE_REGEX = /^([^\s]*)\s+on\s+([\S\s]*)/;
var tags = require('../../../utils/tags');
var codeName = require('../../../utils/code-name');

module.exports = {
  name: 'eventType',
  each: function(doc) {
    var eventTag = tags.getTag(doc.tags, 'eventType');
    if ( eventTag ) {
      var match = EVENTTYPE_REGEX.exec(eventTag.description);
      doc.eventType = match[1];
      doc.eventTarget = codeName.getAbsoluteCodeName(doc, match[2]);
    }
  }
};