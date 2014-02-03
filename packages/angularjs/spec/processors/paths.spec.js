var plugin = require('../../processors/paths');
describe("paths doc processor plugin", function() {
  var outputFolder = 'partials';

  beforeEach(function() {
    plugin.init({}, { value: function() { }});
  });


  it("should compute the path from the document area and id if it is a js file", function() {
    var doc = { basePath: 'src', fileType: 'js', area: 'api', id: 'module:ng.directive:input[checkbox]#someMethod'};
    plugin.process([doc], outputFolder);
    expect(doc.path).toEqual('api/ng/directive/input[checkbox]#someMethod');
    expect(doc.outputPath).toEqual('partials/api/ng/directive/input[checkbox].html');
  });


  it("should compute the path from the area, file name and file type", function() {
    var doc = { fileType: 'ngdoc', file: 'guide/directives.ngdoc', basePath: 'content' };
    plugin.process([doc], outputFolder);
    expect(doc.path).toEqual('guide/directives');
    expect(doc.outputPath).toEqual('partials/guide/directives.html');
  });
});