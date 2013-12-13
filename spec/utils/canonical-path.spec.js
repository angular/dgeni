var canonical = require('../../lib/utils/canonical-path');
var path = require('path');

describe("canonical-path", function() {
  it("should return a path with forward slashes", function() {
    expect(canonical('a'+path.sep+'b'+path.sep+'c')).toEqual('a/b/c');
  });
});