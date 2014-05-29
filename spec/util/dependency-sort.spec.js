var sortByDependency = require('../../lib/util/dependency-sort');

describe("sortByDependency", function() {
  it("should sort the collection by their dependencies", function() {
    var items = [ { name: 'b', before: ['c'], after: ['a']}, { name: 'c' }, { name: 'a' } ];
    items = sortByDependency(items, 'after', 'before');
    expect(items[0].name).toEqual('a');
    expect(items[1].name).toEqual('b');
    expect(items[2].name).toEqual('c');
  });

  it("should error if a dependency is missing", function() {
    expect(function() {
      sortByDependency([{ name: 'a', after: 'missing'}], 'after');
    }).toThrow();
  });

  it("should error if there is a dependency cycle", function() {
    expect(function() {
      sortByDependency([{ name: 'a', after: 'b'}, { name: 'b', after: 'a'}], 'after');
    }).toThrow();
  });

  it("should use an alternate 'name' property if specified", function() {
    var items = [ { id: 'b', before: ['c'], after: ['a']}, { id: 'c' }, { id: 'a' } ];
    items = sortByDependency(items, 'after', 'before', 'id');
    expect(items[0].id).toEqual('a');
    expect(items[1].id).toEqual('b');
    expect(items[2].id).toEqual('c');
  });
});