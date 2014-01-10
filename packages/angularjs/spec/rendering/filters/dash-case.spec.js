var filter = require('../../../rendering/filters/dash-case');

describe("dashCase custom filter", function() {
  it("should have the name 'dashCase'", function() {
    expect(filter.name).toEqual('dashCase');
  });
  it("should transform the content to dash-case", function() {
    expect(filter.process('fooBar')).toEqual('foo-bar');
  });
});