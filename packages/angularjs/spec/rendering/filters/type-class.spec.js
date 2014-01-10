var filter = require('../../../rendering/filters/type-class');

describe("type-class filter", function() {
  it("should convert the given type into a CSS class", function() {
    expect(filter.process('object')).toEqual('label type-hint type-hint-object');
    expect(filter.process('string')).toEqual('label type-hint type-hint-string');
    expect(filter.process('function()')).toEqual('label type-hint type-hint-function');
    expect(filter.process('Regex')).toEqual('label type-hint type-hint-regex');
  });
});