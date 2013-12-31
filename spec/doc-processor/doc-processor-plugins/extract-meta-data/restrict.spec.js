var plugin = require('../../../../lib/doc-processor/doc-processor-plugins/extract-meta-data/restrict');

describe("restrict ngdoc tag", function() {

  function createDoc(restrict) {
    return {
      tags: [ { title: 'restrict', description: restrict } ]
    };
  }

  it("should convert a restrict tag text to an object", function() {
    var doc;

    doc = createDoc('A');
    plugin.each(doc);
    expect(doc.restrict).toEqual({ element: false, attribute: true, cssClass: false, comment: false });

    doc = createDoc('C');
    plugin.each(doc);
    expect(doc.restrict).toEqual({ element: false, attribute: false, cssClass: true, comment: false });

    doc = createDoc('E');
    plugin.each(doc);
    expect(doc.restrict).toEqual({ element: true, attribute: false, cssClass: false, comment: false });

    doc = createDoc('M');
    plugin.each(doc);
    expect(doc.restrict).toEqual({ element: false, attribute: false, cssClass: false, comment: true });

    doc = createDoc('ACEM');
    plugin.each(doc);
    expect(doc.restrict).toEqual({ element: true, attribute: true, cssClass: true, comment: true });
  });

  it("should default to restricting to an attribute if no tag is found and the doc is for a directive", function() {
    var doc = {
      componentType: 'directive'
    };
    plugin.each(doc);
    expect(doc.restrict).toEqual({ element: false, attribute: true, cssClass: false, comment: false });
  });

  it("should not add a restrict property if the doc is not a directive", function() {
    var doc = {
      componentType: ''
    };
    plugin.each(doc);
    expect(doc.restrict).toBeUndefined();
  });
});