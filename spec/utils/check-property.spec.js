var checkProperty = require('../../lib/utils/check-property');
describe("check-property", function() {
  it("should do nothing if the property exists on the object", function() {
    expect(function() {
      checkProperty({ a: 'a', b: 'b'}, 'b')
    }).not.toThrow();
  });
  it("should do nothing if the property exists but is falsy on the object", function() {
    expect(function() {
      checkProperty({ 'empty': ''}, 'empty');
      checkProperty({ 'null': null}, 'null');
      checkProperty({ 'undefined': undefined}, 'undefined');
    }).not.toThrow();
  });
  it("should throw an exception if the property does not exist on the object", function() {
    expect(function() {
      checkProperty({ a: 'a', b: 'b'}, 'x')
    }).toThrow();
  });
});