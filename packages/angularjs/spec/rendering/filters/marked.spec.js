var rewire = require('rewire');
var filter = rewire('../../../rendering/filters/marked');

describe("marked custom filter", function() {
  var markedMock;

  beforeEach(function() {
    markedMock = jasmine.createSpy('marked').andReturn('bar');
    filter.__set__('marked', markedMock);
  });
  it("should have the name 'marked'", function() {
    expect(filter.name).toEqual('marked');
  });
  it("should transform the content using the provided marked function", function() {
    expect(filter.process('foo')).toEqual('bar');
    expect(markedMock).toHaveBeenCalledWith('foo');
  });
});