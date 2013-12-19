var rewire = require('rewire');
var filter = rewire('../../../lib/doc-renderer/custom-filters/code');

describe("code custom filter", function() {
  var markedMock;

  beforeEach(function() {
    markedMock = jasmine.createSpy('marked').andReturn('<code>bar</code>');
    filter.__set__('marked', markedMock);
  });
  it("should have the name 'code'", function() {
    expect(filter.name).toEqual('code');
  });
  it("should transform the content using the provided marked function, wrapped in back-ticks", function() {
    expect(filter.process('foo')).toEqual('<code>bar</code>');
    expect(markedMock).toHaveBeenCalledWith('`foo`');
  });
});