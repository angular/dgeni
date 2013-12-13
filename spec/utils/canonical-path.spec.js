var canonical = require('../../lib/utils/canonical-path');
var path = require('path');

describe("canonical-path", function() {
  it("should return a path with forward slashes", function() {
    expect(canonical(path.normalize('a/b/c'))).toEqual('a/b/c');
  });
});