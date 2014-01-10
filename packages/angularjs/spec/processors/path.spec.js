var plugin = require('../../processors/path');
describe("path doc processor plugin", function() {
  it("should compute the path from the document section and id if it is a js file", function() {
    var doc = { fileType: 'js', section: 'api', id: 'module:ng.directive:input[checkbox]#someMethod'};
    plugin.each(doc);
    expect(doc.path).toEqual('api/ng/directive/input[checkbox]#someMethod');
  });

  it("should compute the path from the section file name and file type", function() {
    var doc = { fileType: 'ngdoc', file: 'guide/directives.ngdoc'};
    plugin.each(doc);
    expect(doc.path).toEqual('guide/directives');
  });
});