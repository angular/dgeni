var mergeDocs = require('../../lib/doc-parser-plugins/doc-merger');

describe('doc-merger', function() {
  var docs, mergedDocs;
  beforeEach(function() {
    docs = [
      { id: 'x.y.z' },
      { id: 'a.b.c#prop', propertyOf: 'a.b.c' },
      { id: 'a.b.c' },
      { id: 'a.b.c#event', eventOf: 'a.b.c' },
      { id: 'f.g.h' },
      { id: 'a.b.c#method', methodOf: 'a.b.c' },
    ];
    mergedDocs = mergeDocs(docs);
  });

  it("should merge property docs into the parent doc", function() {
    expect(mergedDocs[1].properties).toEqual([{ id: 'a.b.c#prop', propertyOf: 'a.b.c' }]);
  });

  it("should merge method docs into the parent doc", function() {
    expect(mergedDocs[1].methods).toEqual([{ id: 'a.b.c#method', methodOf: 'a.b.c' }]);
  });

  it("should merge event docs into the parent doc", function() {
    expect(mergedDocs[1].events).toEqual([{ id: 'a.b.c#event', eventOf: 'a.b.c' }]);
  });

  it("should remove child docs from the merged docs collection", function() {
    expect(mergedDocs.length).toEqual(3);
  });
});