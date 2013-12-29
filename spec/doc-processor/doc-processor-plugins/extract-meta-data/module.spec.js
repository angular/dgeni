var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/module');
describe("module doc processor plugin", function() {
  it("extracts the module from the module tag if it is there", function() {
    var doc = { tags: [ { title: 'module', description: 'ngRoute' }]};
    plugin.each(doc);
    expect(doc.module).toEqual('ngRoute');
  });
  it("extracts the module from the file name if it is a js file", function() {
    var doc = { fileType: 'js', file: 'src/ng/compile.js' };
    plugin.each(doc);
    expect(doc.module).toEqual('ng');
  });
});