var processor = require('../../processors/service-provider-mapping');


describe("service-provider-mapping doc processor", function() {
  it("should be named 'service-provider-mapping'", function() {
      expect(processor.name).toEqual('service-provider-mapping');
  });

  it("should link up services and their service-provider-mapping", function() {
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