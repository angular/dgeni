var forEachRecursive = require('../../lib/utils/for-each-recursive');
var _ = require('lodash');

function toUpperCase(prop) {
  if ( _.isString(prop) ) {
    return prop.toUpperCase();
  }
}

describe("for-each-recursive", function() {
  it("should apply the function to all top level properties that are not enumerable", function() {
    expect(forEachRecursive(['a','b','c'], toUpperCase)).toEqual(['A', 'B', 'C']);
  });
  it("should apply the function to all items in a property that is an array", function() {
    expect(forEachRecursive([['a','b','c']], toUpperCase)).toEqual([['A', 'B', 'C']]);
  });
  it("should apply the function to all items in a property that is an object", function() {
    expect(forEachRecursive([{ a:'a', b:'b', c:'c'}], toUpperCase)).toEqual([{a:'A', b:'B', c:'C'}]);
  });
  it("should apply the function to all properties recursively", function() {
    expect(forEachRecursive([
      { a: 'a', b: [ 'x', 'y', 'z'], c: { i: 'i', j:'j', k:'k'}, d: [ [ { m: [ { n: 'o' }]}]]}
    ], toUpperCase)).toEqual([
      { a: 'A', b: [ 'X', 'Y', 'Z'], c: { i: 'I', j:'J', k:'K'}, d: [ [ { m: [ { n: 'O' }]}]]}
    ]);
  });
});