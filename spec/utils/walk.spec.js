var walk = require('../../lib/utils/walk');
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

describe("walk", function() {
  it("should apply the function to all properties on an object", function() {
    expect(walk({ a:'a', b:'b', c:'c'}, toUpperCase)).toEqual({a:'A', b:'B', c:'C'});
  });
  it("should apply the function to all items in an array", function() {
    expect(walk(['a','b','c'], toUpperCase)).toEqual(['A', 'B', 'C']);
  });
  it("should apply the function to all items in a nested array", function() {
    expect(walk([['a','b','c']], toUpperCase)).toEqual([['A', 'B', 'C']]);
  });
  it("should apply the function to all items in a nested object", function() {
    expect(walk({ x: { a:'a', b:'b', c:'c'}}, toUpperCase)).toEqual({x:{a:'A', b:'B', c:'C'}});
  });
  it("should apply the function to all properties recursively", function() {
    expect(walk([
      { a: 'a', b: [ 'x', 'y', 'z'], c: { i: 'i', j:'j', k:'k'}, d: [ [ { m: [ { n: 'o' }]}]]}
    ], toUpperCase)).toEqual([
      { a: 'A', b: [ 'X', 'Y', 'Z'], c: { i: 'I', j:'J', k:'K'}, d: [ [ { m: [ { n: 'O' }]}]]}
    ]);
  });

  it("should provide the key to the handler function", function() {
    expect(walk({ a: 'a', b:'b', 'bad': 'xxx'}, deleteBad)).toEqual({ a: 'a', b:'b' });
  });

  it("should apply the function to properties that are arrays", function() {
    expect(walk({ a: ['a'], 'bad': ['xxx']}, deleteBad)).toEqual({ a: ['a']});
  });

  it("should apply the function to properties that are objects", function() {
    expect(walk({ a: ['a'], 'bad': { x: 'xxx'} }, deleteBad)).toEqual({ a: ['a']});
  });

  it("should cope with circular references", function() {

    var obj = { a: 1, b: 2, c: {} };
    obj.c.circular = obj;
    
    expect(function() { walk(obj, function(x) { return x; }); }).not.toThrow();
  });
});