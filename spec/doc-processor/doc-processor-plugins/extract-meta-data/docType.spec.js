var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/docType');
describe("docType doc processor plugin", function() {
  it("should extract the docType from the ngdoc tag", function() {
    var doc = { tags: [ { title: 'ngdoc', description: 'directive' }]};
    plugin.each(doc);
    expect(doc.docType).toEqual('directive');
  });
});