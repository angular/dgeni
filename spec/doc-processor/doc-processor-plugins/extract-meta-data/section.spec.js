var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/section');
describe("section doc processor plugin", function() {
  it("should extract the section from the tag if it exists", function() {
    var doc = { tags: [{title:'section', description: 'xyz'}]};
    plugin.each(doc);
    expect(doc.section).toEqual('xyz');
  });
  it("should be 'api' if the fileType is js", function() {
    var doc = { fileType: 'js' };
    plugin.each(doc);
    expect(doc.section).toEqual('api');
  });
  it("should compute the section from the file name", function() {
    var doc = { fileType: 'ngdoc', file: 'guide/scope/binding.ngdoc' };
    plugin.each(doc);
    expect(doc.section).toEqual('guide');
  });
});