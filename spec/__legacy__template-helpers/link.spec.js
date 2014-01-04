//var tagHandler = require('../../lib/__legacy__template-helpers/link.js');

xdescribe("link inline ngdoc tag", function() {

  describe("links to code", function() {

    it("should push links into the document links property", function() {
      var someDoc = { module: 'ng', name:'ngClass', ngdoc:'directive', section: 'api' };

      tagHandler(someDoc, 'link', 'ngClass');
      expect(someDoc.links[0]).toEqual('/api/ng/directive/ngClass');

      tagHandler(someDoc, 'link', 'http://www.google.com Google');
      expect(someDoc.links[1]).toEqual('http://www.google.com');
    });
  });
});