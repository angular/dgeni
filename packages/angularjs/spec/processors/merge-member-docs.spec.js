var _ = require('lodash');
var plugin = require('../../processors/merge-member-docs');
var PartialNames = require('../../../../lib/utils/partial-names').PartialNames;

describe('merge-member-docs', function() {
  var docs, mergedDocs;
  beforeEach(function() {
    docs = [
      { docType: 'service', id: 'x.y.z' },
      { docType: 'property', id: 'a.b.c#someProp' },
      { docType: 'service',  id: 'a.b.c' },
      { docType: 'event', id: 'someEvent', memberof: 'a.b.c' },
      { docType: 'service',  id: 'f.g.h' },
      { docType: 'method', id: 'a.b.c#someMethod' },
    ];
    var partialNames = new PartialNames(docs);
    mergedDocs = plugin.process(docs, partialNames);
  });

  it("should merge property docs into the parent doc", function() {
    expect(mergedDocs[1].properties[0]).toEqual(docs[1]);
  });

  it("should merge method docs into the parent doc", function() {
    expect(mergedDocs[1].methods[0]).toEqual(docs[5]);
  });

  it("should merge event docs into the parent doc", function() {
    expect(mergedDocs[1].events[0]).toEqual(docs[3]);
  });

  it("should remove child docs from the merged docs collection", function() {
    expect(mergedDocs.length).toEqual(3);
  });

  it("should sort child docs by name", function() {
    var docs = [
      { docType: 'object', id: 'a' },
      { docType: 'method', name: 'c', id: 'a#c' },
      { docType: 'method', name: 'g', id: 'a#g' },
      { docType: 'method', name: 'd', id: 'a#d' },
      { docType: 'method', name: 'b', id: 'a#b' }
    ];
    var partialNames = new PartialNames(docs);
    docs = plugin.process(docs, partialNames);
    var parent = docs[0];
    expect(_.map(parent.methods, 'id')).toEqual(['b', 'c', 'd', 'g']);
  });
});