var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/componentType');
describe("componentType doc processor plugin", function() {

  function createDoc(docType) {
    return { docType: docType };
  }

  it("should set componentType to be an empty string if the docType is not one of the special types", function() {
    var doc = createDoc('otherType');
    plugin.each(doc);
    expect(doc.componentType).toEqual('');
  });

  it("should set componentType to directive if the docType is a directive type", function() {
    var doc = createDoc('directive');
    plugin.each(doc);
    expect(doc.componentType).toEqual('directive');
    
    doc = createDoc('input');
    plugin.each(doc);
    expect(doc.componentType).toEqual('directive');
  });

  it("should set componentType to filter if the docType is filter", function() {
    var doc = createDoc('filter');
    plugin.each(doc);
    expect(doc.componentType).toEqual('filter');
  });

  it("should set componentType to global if the docType isa global type", function() {
    var doc = createDoc('object');
    plugin.each(doc);
    expect(doc.componentType).toEqual('global');

    doc = createDoc('function');
    plugin.each(doc);
    expect(doc.componentType).toEqual('global');
  });
});