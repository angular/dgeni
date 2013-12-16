var tagProcessor = require('../../../lib/doc-parser-plugins/ngdoc-tags/eventType');

function createTag(name, text) {
  return { name: name, text: text};
}

describe("eventType tag", function() {

  it("should throw an error if the tag is badly formatted", function() {
    var tag = createTag('eventType', 'some event info');
    var doc = {};
    expect(function() { tagProcessor(tag, doc); }).toThrow();
  });      

  it("should add an eventType and eventTarget property to the doc", function() {
    var tag = createTag('eventType', 'eventName on someObject');
    var doc = {};
    tagProcessor(tag, doc);
    expect(doc.eventType).toEqual('eventName');
    expect(doc.eventTarget).toEqual('someObject');
  });

});
