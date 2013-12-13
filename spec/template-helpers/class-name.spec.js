var className = require('../../lib/template-helpers/class-name');

describe("class-name", function() {
  describe("prepareClassName", function() {
    it("should lower case the string and replace non-word characters with hyphens", function() {
      expect(className.prepareClassName('AbC')).toEqual('abc');
      expect(className.prepareClassName('a_b')).toEqual('a-b');
      expect(className.prepareClassName('a#b')).toEqual('a-b');
      expect(className.prepareClassName('a$b')).toEqual('a-b');
      expect(className.prepareClassName('a.b')).toEqual('a-b');
    });
  });

  describe("prepareTypeHintClassName", function() {
    it("should create a set of CSS classes from the type name", function() {
      expect(className.prepareTypeHintClassName('string')).toEqual('label type-hint type-hint-string');
      expect(className.prepareTypeHintClassName('')).toEqual('label type-hint type-hint-object');
      expect(className.prepareTypeHintClassName('x-Y-z')).toEqual('label type-hint type-hint-x-y-z');
    });
  });
});