var filter = require('../../../lib/doc-renderer/custom-filters/code-link');

describe("code-link filter", function() {

  it("should have the name 'codeLink'", function() {
    expect(filter.name).toEqual('codeLink');
  });

  it("should return an HTML anchor for a code", function() {
        
  });
});