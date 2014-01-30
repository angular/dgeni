var processor = require('../../processors/providers');


describe("providers doc processor", function() {
  it("should be named 'providers'", function() {
      expect(processor.name).toEqual('providers');
  });

  it("should link up services and their providers", function() {
    var compileProviderDoc = { docType: 'provider', id: 'module:ng.$compileProvider' };
    var compileDoc = { docType: 'service', id: 'module:ng.$compile' };

    docs = [
      compileDoc,
      compileProviderDoc
    ];

    processor.after(docs);

    expect(compileDoc.providerDoc).toBe(compileProviderDoc);
    expect(compileProviderDoc.serviceDoc).toBe(compileDoc);
  });
});