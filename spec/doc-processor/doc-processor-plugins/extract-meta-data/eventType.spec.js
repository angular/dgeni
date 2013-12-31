var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/eventType');
describe("eventType doc processor plugin", function() {

  it("should add an eventType and eventTarget property to the doc", function() {
    var doc = {
      module: 'ng',
      tags: [
        { title: 'eventType', description: 'broadcast on directive:ngInclude' }
      ]
    };
    plugin.each(doc);
    expect(doc.eventType).toEqual('broadcast');
    expect(doc.eventTarget).toEqual('module:ng.directive:ngInclude');
  });
});
