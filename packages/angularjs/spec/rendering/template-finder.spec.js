var rewire = require('rewire');
var finderFactory = rewire('../../rendering/template-finder');

describe("angular template-finder", function() {
  var fs, finder;
  beforeEach(function() {
    fs = finderFactory.__get__('fs');
    spyOn(fs, 'readdirSync').andReturn([
      'a.x',
      'b.x',
      'c.x',
      'c.a.x',
      'f.other'
    ]);
    finder = finderFactory({ rendering: { templatePath: 'abc', templateExtension: 'x' } });
  });

  it("should match id followed by doctype if both are provided and the file exists", function() {
    expect(finder({ docType: 'a', id: 'c'})).toEqual('c.a.x');
  });

  it("should match id before docType", function() {
    expect(finder({ docType: 'a', id: 'b' })).toEqual('b.x');
  });

  it("should match docType if id doesn't match", function() {
    expect(finder({ docType: 'a', id: 'missing' })).toEqual('a.x');
  });

  it("should match docType if id is undefined", function() {
    expect(finder({ docType: 'a' })).toEqual('a.x');
  });

});