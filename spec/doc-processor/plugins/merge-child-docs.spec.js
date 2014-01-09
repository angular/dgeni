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
});