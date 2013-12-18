var dashCase = require('../../lib/utils/dash-case');

describe("dashCase function", function() {
  it("should convert names to dash-case", function() {
    expect(dashCase('fooBar')).toEqual('foo-bar');
  });
});