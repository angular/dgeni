var plugin = require('../../processors/output-path');
describe("output-path doc processor", function() {

  var outputFolder = 'partials';

  it("should compute the path from the document's parents'", function() {
    var apiDoc = {
      docType: 'overview',
      fileType: 'ngdoc',
      file: 'api/index.ngdoc',
      fileName: 'index',
      area: 'api',
      id: 'index'
    };
    var ngDoc = {
      fileType: 'js',
      docType: 'module',
      area: 'api',
      module: 'ng',
      name: 'ng',
      id: 'module:ng'
    };
    var directiveDoc = {
      fileType: 'js',
      docType: 'componentGroup',
      area: 'api',
      groupType: 'directive',
      module: 'ng',
      id: 'module:ng.directive'
    };
    var ngClassDoc = {
      fileType: 'js',
      docType: 'directive',
      area: 'api',
      module: 'ng',
      name: 'ngClass',
      id: 'module:ng.directive:ngClass',
    };
    var docs = [ngDoc, directiveDoc, ngClassDoc];
    plugin.process(docs, outputFolder);

    expect(ngClassDoc.outputPath).toEqual('partials/api/ng/directive/ngClass.html');
    expect(directiveDoc.outputPath).toEqual('partials/api/ng/directive/index.html');
    expect(ngDoc.outputPath).toEqual('partials/api/ng/index.html');
    expect(apiDoc.outputPath).toEqual('partials/api/index.html');
  });

});