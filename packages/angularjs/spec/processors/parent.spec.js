var plugin = require('../../processors/parent');
var PartialNames = require('../../../../lib/utils/partial-names').PartialNames;

describe("parent doc processor", function() {

  it("should connect the docs to their parent", function() {
    var apiDoc = {
      docType: 'overview',
      id: 'module'
    };
    var ngDoc = {
      docType: 'module',
      id: 'module:ng'
    };
    var directiveDoc = {
      docType: 'componentGroup',
      groupType: 'directive',
      id: 'module:ng.directive'
    };
    var ngClassDoc = {
      docType: 'directive',
      id: 'module:ng.directive:ngClass'
    };

    var functionDoc = {
      docType: 'componentGroup',
      groupType: 'function',
      id: 'module:ng.function'
    };

    var elementDoc = {
      docType: 'function',
      id: 'module:ng.function:angular.element'
    };

    var guideDoc = {
      docType: 'overview',
      id: 'guide'
    };

    var controllerGuideDoc = {
      docType: 'overview',
      id: 'controller'
    };

    var docs = [apiDoc, ngDoc, directiveDoc, ngClassDoc, functionDoc, elementDoc, guideDoc, controllerGuideDoc];

    var partialNames = new PartialNames(docs);
    var topLevelDocs = [];

    plugin.process(docs, partialNames, topLevelDocs);

    expect(ngClassDoc.parentDoc).toBe(directiveDoc);
    expect(directiveDoc.parentDoc).toBe(ngDoc);

    expect(elementDoc.parentDoc).toBe(functionDoc);
    expect(functionDoc.parentDoc).toBe(ngDoc);

    expect(ngDoc.parentDoc).toBe(apiDoc);
  });
});