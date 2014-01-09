var _ = require('lodash');
var plugin = require('../../../lib/doc-processor/plugins/merge-child-docs');

describe('merge-child-docs', function() {
  var docs, mergedDocs;
  beforeEach(function() {
    docs = [
      { docType: 'service', id: 'x.y.z' },
      { docType: 'property', id: 'a.b.c#someProp', memberof: 'a.b.c' },
      { docType: 'service',  id: 'a.b.c' },
      { docType: 'event', id: 'a.b.c#someEvent', memberof: 'a.b.c' },
      { docType: 'service',  id: 'f.g.h' },
      { docType: 'method', id: 'a.b.c#someMethod', memberof: 'a.b.c' },
    ];
    mergedDocs = plugin.after(docs);
  });

  it("should merge property docs into the parent doc", function() {
    expect(mergedDocs[1].properties[0].id).toEqual('a.b.c#someProp');
  });

  it("should merge method docs into the parent doc", function() {
    expect(mergedDocs[1].methods[0].id).toEqual('a.b.c#someMethod');
  });

  it("should merge event docs into the parent doc", function() {
    expect(mergedDocs[1].events[0].id).toEqual('a.b.c#someEvent');
  });

  it("should remove child docs from the merged docs collection", function() {
    expect(mergedDocs.length).toEqual(3);
  });

  it("should sort child docs by name", function() {
    var docs = [
      { docType: 'object', id: 'a' },
      { docType: 'method', name: 'c', id: 'a#', memberof:'a' },
      { docType: 'method', name: 'g', id: 'a#g', memberof:'a' },
      { docType: 'method', name: 'd', id: 'a#d', memberof:'a' },
      { docType: 'method', name: 'b', id: 'a#b', memberof:'a' }
    ];
    docs = plugin.after(docs);
    var parent = docs[0];
    expect(_.map(parent.methods, 'name')).toEqual(['b', 'c', 'd', 'g']);
  });
});