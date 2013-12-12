var placeHolder = require('../../lib/utils/placeholder-map');

describe("placeholder-map", function() {
  var doc;

  beforeEach(function() {
    doc = {};
  });

  it("should add the text to the map", function() {
    placeHolder.init(doc);
    var id = placeHolder.add(doc, 'some text');
    expect(placeHolder.get(doc, id)).toEqual('some text');
  });
  it('should generate a new id for each item', function() {
    placeHolder.init(doc);
    var id0 = placeHolder.add(doc, 'some text');
    var id1 = placeHolder.add(doc, 'other text');
    expect(id0).toEqual('REPLACEME0');
    expect(id1).toEqual('REPLACEME1');
  });
  it('should clear the map and reset the counter when init is called', function() {
    placeHolder.init(doc);
    var id0 = placeHolder.add(doc, 'some text');
    var id1 = placeHolder.add(doc, 'other text');
    expect(placeHolder.get(doc, id0)).toBeDefined();
    expect(placeHolder.get(doc, id1)).toBeDefined();
    placeHolder.init(doc);
    expect(placeHolder.get(doc, id0)).not.toBeDefined();
    expect(placeHolder.get(doc, id1)).not.toBeDefined();
    var id3 = placeHolder.add(doc, 'some text');
    expect(id3).toEqual('REPLACEME0');
  });
});