var plugin = require('../../processors/input-type');

describe("input-type processor plugin", function() {
  it("should have name 'input-type", function() {
    expect(plugin.name).toEqual('input-type');
  });
  it("should compute the 'type' if the doc is for an input directive", function() {
    
    var doc = { docType: 'input', name: 'input[checkbox]'};
    plugin.each(doc);
    expect(doc.inputType).toEqual('checkbox');

    doc = { docType: 'directive', name: 'input[checkbox]'};
    plugin.each(doc);
    expect(doc.inputType).toBeUndefined();

    doc = { docType: 'input', name: 'invalidInputName'};
    expect(function() {
      plugin.each(doc);
    }).toThrow();
  });
});