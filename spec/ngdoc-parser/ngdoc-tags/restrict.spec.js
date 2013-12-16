var tagHandler = require('../../../lib/ngdoc-parser/ngdoc-tags/restrict');

function createTag(name, text) {
  return { name: name, text: text};
}

describe("restrict ngdoc tag", function() {
  it("converts a restrict tag text to an object", function() {
    var doc = {};
    var tag = createTag('restrict', 'A');

    expect(tagHandler(tag, doc)).toEqual(true);
    expect(doc.restrict).toEqual({ element: false, attribute: true, cssClass: false, comment: false });

    tag = createTag('restrict', 'C');
    expect(tagHandler(tag, doc)).toEqual(true);
    expect(doc.restrict).toEqual({ element: false, attribute: false, cssClass: true, comment: false });

    tag = createTag('restrict', 'E');
    expect(tagHandler(tag, doc)).toEqual(true);
    expect(doc.restrict).toEqual({ element: true, attribute: false, cssClass: false, comment: false });

    tag = createTag('restrict', 'M');
    expect(tagHandler(tag, doc)).toEqual(true);
    expect(doc.restrict).toEqual({ element: false, attribute: false, cssClass: false, comment: true });

    tag = createTag('restrict', 'ACEM');
    expect(tagHandler(tag, doc)).toEqual(true);
    expect(doc.restrict).toEqual({ element: true, attribute: true, cssClass: true, comment: true });
  });
});