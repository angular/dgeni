var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/name');
describe("name doc processor plugin", function() {
  it("should extract the name tag into the doc.name property", function() {
    var doc = { tags: [ { title: 'name', description: 'someName' }]};
    plugin.each(doc);
    expect(doc.name).toEqual('someName');
  });

  it("should throw an error if the tag is missing", function() {
    var doc = { tags: [ { title: 'notName', description: 'someName' }]};
    expect(function() {
      plugin.each(doc);
    }).toThrow();
  });
});