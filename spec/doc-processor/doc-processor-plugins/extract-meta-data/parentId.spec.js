var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/parentId');
describe("parentId doc processor plugin", function() {
  it("should extract the parentId from eventOf if the doc is an event", function() {
    var doc = {
      docType: 'event',
      module: 'ng',
      name: '$includeContentRequested',
      tags: [ { title: 'eventOf', description: 'module:ng.directive:ngInclude' }]
    };
    plugin.each(doc);
    expect(doc.parentId).toEqual('module:ng.directive:ngInclude');
  });

  it("should extract the parentId from methodOf if the doc is an method", function() {
    var doc = {
      docType: 'method',
      module: 'ng',
      name: 'addControl',
      tags: [ { title: 'methodOf', description: 'directive:form.FormController' }]
    };
    plugin.each(doc);
    expect(doc.parentId).toEqual('module:ng.directive:form.FormController');
  });

  it("should extract the parentId from propertyOf if the doc is an property", function() {
    var doc = {
      docType: 'property',
      module: 'ng',
      componentType: '',
      name: 'defaults',
      tags: [ { title: 'propertyOf', description: '$http' }]
    };
    plugin.each(doc);
    expect(doc.parentId).toEqual('module:ng.$http');
  });
});