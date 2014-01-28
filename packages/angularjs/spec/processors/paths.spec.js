var plugin = require('../../processors/paths');
describe("paths doc processor plugin", function() {
  beforeEach(function() {
    plugin.init();
  });
  it("should compute the path from the document section and id if it is a js file", function() {
    var doc = { basePath: 'src', fileType: 'js', section: 'api', id: 'module:ng.directive:input[checkbox]#someMethod'};
    plugin.each(doc);
    expect(doc.path).toEqual('api/ng/directive/input[checkbox]#someMethod');
    expect(doc.outputPath).toEqual('partials/api/ng/directive/input[checkbox].html');
  });

  it("should compute the path from the section file name and file type", function() {
    var doc = { fileType: 'ngdoc', file: 'guide/directives.ngdoc', basePath: 'content' };
    plugin.each(doc);
    expect(doc.path).toEqual('guide/directives');
    expect(doc.outputPath).toEqual('partials/guide/directives.html');
  });
});