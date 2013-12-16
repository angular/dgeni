var forEachRecursive = require('../../lib/utils/for-each-recursive');
var _ = require('lodash');

function toUpperCase(prop) {
  if ( _.isString(prop) ) {
    return prop.toUpperCase();
  }
  return prop;
}

function deleteBad(prop, key) {
  if ( key !== 'bad' ) {
    return prop;
  }
}

describe("for-each-recursive", function() {
  it("should apply the function to all properties on an object", function() {
    expect(forEachRecursive({ a:'a', b:'b', c:'c'}, toUpperCase)).toEqual({a:'A', b:'B', c:'C'});
  });
  it("should apply the function to all items in an array", function() {
    expect(forEachRecursive(['a','b','c'], toUpperCase)).toEqual(['A', 'B', 'C']);
  });
  it("should apply the function to all items in a nested array", function() {
    expect(forEachRecursive([['a','b','c']], toUpperCase)).toEqual([['A', 'B', 'C']]);
  });
  it("should apply the function to all items in a nested object", function() {
    expect(forEachRecursive({ x: { a:'a', b:'b', c:'c'}}, toUpperCase)).toEqual({x:{a:'A', b:'B', c:'C'}});
  });
  it("should apply the function to all properties recursively", function() {
    expect(forEachRecursive([
      { a: 'a', b: [ 'x', 'y', 'z'], c: { i: 'i', j:'j', k:'k'}, d: [ [ { m: [ { n: 'o' }]}]]}
    ], toUpperCase)).toEqual([
      { a: 'A', b: [ 'X', 'Y', 'Z'], c: { i: 'I', j:'J', k:'K'}, d: [ [ { m: [ { n: 'O' }]}]]}
    ]);
  });

  it("should provide the key to the handler function", function() {
    expect(forEachRecursive({ a: 'a', b:'b', 'bad': 'xxx'}, deleteBad)).toEqual({ a: 'a', b:'b' });
  });

  it("should apply the function to properties that are arrays", function() {
    expect(forEachRecursive({ a: ['a'], 'bad': ['xxx']}, deleteBad)).toEqual({ a: ['a']});
  });

  it("should apply the function to properties that are objects", function() {
    expect(forEachRecursive({ a: ['a'], 'bad': { x: 'xxx'} }, deleteBad)).toEqual({ a: ['a']});
  });
});