var plugin = require('../../processors/paths');
describe("paths doc processor plugin", function() {
  var outputFolder = 'partials';

  it("should compute the path from the document's parents'", function() {
    var apiDoc = {
      docType: 'overview',
      id: 'api',
      pathSegment: 'api'
    };
    var ngDoc = {
      docType: 'module',
      id: 'module:ng',
      pathSegment: 'ng',
      parentDoc: apiDoc
    };
    var directiveDoc = {
      docType: 'componentGroup',
      id: 'module:ng.directive',
      pathSegment: 'directive',
      parentDoc: ngDoc
    };
    var ngClassDoc = {
      docType: 'directive',
      id: 'module:ng.directive:ngClass',
      pathSegment: 'ngClass',
      parentDoc: directiveDoc
    };
    var docs = [ngDoc, directiveDoc, ngClassDoc];
    plugin.process(docs, outputFolder);

    expect(ngClassDoc.path).toEqual('api/ng/directive/ngClass');
    expect(ngClassDoc.outputPath).toEqual('partials/api/ng/directive/ngClass.html');
  });

});