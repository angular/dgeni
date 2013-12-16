var mergeDocs = require('../../../lib/doc-processor/doc-processor-plugins/doc-merger');

describe('doc-merger', function() {
  var docs, mergedDocs;
  beforeEach(function() {
    docs = [
      { ngdoc: 'service', id: 'x.y.z' },
      { ngdoc: 'property', id: 'a.b.c#someProp' },
      { ngdoc: 'service',  id: 'a.b.c' },
      { ngdoc: 'event', id: 'a.b.c#someEvent' },
      { ngdoc: 'service',  id: 'f.g.h' },
      { ngdoc: 'method', id: 'a.b.c#someMethod' },
    ];
    mergedDocs = mergeDocs(docs);
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