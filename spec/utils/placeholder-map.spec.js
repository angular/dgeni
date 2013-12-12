var PlaceHolderMap = require('../../lib/utils/placeholder-map');

describe("placeholder-map", function() {
  it("should add the text to the map", function() {
    var placeHolders = new PlaceHolderMap();
    var id = placeHolders.add('some text');
    expect(placeHolders.get(id)).toEqual('some text');
  });
  it('should generate a new id for each item', function() {
    var placeHolders = new PlaceHolderMap();
    var id0 = placeHolders.add('some text');
    var id1 = placeHolders.add('other text');
    var id2 = placeHolders.add('some text'); // same text but different id
    expect(id0).toEqual('REPLACEME0');
    expect(id1).toEqual('REPLACEME1');
    expect(id2).toEqual('REPLACEME2');
  });
});