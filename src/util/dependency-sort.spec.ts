const {expect, spy} = require('chai').use(require('chai-spies'));

import {sortByDependency} from './dependency-sort';

describe('sortByDependency', () => {
  it('should sort the collection by their dependencies', () => {
    let items = [ { name: 'b', before: ['c'], after: ['a']}, { name: 'c' }, { name: 'a' } ];
    items = sortByDependency(items, 'after', 'before');
    expect(items[0].name).to.equal('a');
    expect(items[1].name).to.equal('b');
    expect(items[2].name).to.equal('c');
  });

  it('should error if the name property is missing on an item', () => {
    expect(() => sortByDependency([{ id: 'x'}])).to.throw();
  });

  it('should error if a dependency is missing', () => {
    expect(() => sortByDependency([{ name: 'a', after: ['missing']}], 'after')).to.throw();
    expect(() => sortByDependency([{ name: 'a', before: ['missing']}], null, 'before')).to.throw();
  });

  it('should error if either before or after properties are not arrays', () => {
    expect(() => sortByDependency([{ name: 'a', after: 'not array'}], 'after')).to.throw();
    expect(() => sortByDependency([{ name: 'a', before: 'not array'}], null, 'before')).to.throw();
  });

  it('should error if there is a dependency cycle', () => {
    expect(() => sortByDependency([{ name: 'a', after: 'b'}, { name: 'b', after: 'a'}], 'after')).to.throw();
  });

  it('should use an alternate "name" property if specified', () => {
    let items = [ { id: 'b', before: ['c'], after: ['a']}, { id: 'c' }, { id: 'a' } ];
    items = sortByDependency(items, 'after', 'before', 'id');
    expect(items[0].id).to.equal('a');
    expect(items[1].id).to.equal('b');
    expect(items[2].id).to.equal('c');
  });
});