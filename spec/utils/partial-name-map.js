var util = require('../../lib/utils/partial-name-map');

describe("partial-name-map", function() {

  describe("PartialNames", function() {
    it("should return an array of partial names for a full code name", function() {
      var partialNames = new util.PartialNames();
      var doc = { id: 'module:ng.service:$http#get' };
      partialNames.addDoc(doc);
      expect(partialNames.map).toEqual({
        '$http#get': doc,
        'service:$http#get': doc,
        'ng.$http#get': doc,
        'module:ng.$http#get': doc,
        'ng.service:$http#get': doc,
        'module:ng.service:$http#get': doc,
        'get': doc
      });
    });
  });

});