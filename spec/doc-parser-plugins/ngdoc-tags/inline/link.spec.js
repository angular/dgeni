var tagHandler = require('../../../../lib/doc-parser-plugins/ngdoc-tags/inline/link.js');

describe("link inline ngdoc tag", function() {

  describe('links to real urls', function() {
    it("should replace urls containing slashes with HTML anchors to the same url", function() {
      var someDoc = { };

      expect(tagHandler(someDoc, 'link', '/some/absolute/url some link')).toEqual('<a href="/some/absolute/url">some link</a>');
      expect(tagHandler(someDoc, 'link', 'some/relative/url some other link')).toEqual('<a href="some/relative/url">some other link</a>');
      expect(tagHandler(someDoc, 'link', '../some/other/relative/url some link')).toEqual('<a href="../some/other/relative/url">some link</a>');
      expect(tagHandler(someDoc, 'link', 'http://www.google.com Google')).toEqual('<a href="http://www.google.com">Google</a>');
    });
  });

  describe("links to code", function() {
    var someDoc;

    beforeEach(function() {
      someDoc = { module: 'ng', name:'ngClass', ngdoc:'directive', section: 'api' };
    });


    it("should replace relative references to code in the current module with HTML anchors to the correct url", function() {
      expect(tagHandler(someDoc, 'link', 'ngShow')).toEqual('<a href="/api/ng/directive/ngShow"><code>ngShow</code></a>');
      expect(tagHandler(someDoc, 'link', 'directive:ngShow')).toEqual('<a href="/api/ng/directive/ngShow"><code>ngShow</code></a>');

      expect(tagHandler(someDoc, 'link', 'input[checkbox]')).toEqual('<a href="/api/ng/directive/input[checkbox]"><code>input[checkbox]</code></a>');
      expect(tagHandler(someDoc, 'link', 'filter:currency')).toEqual('<a href="/api/ng/filter/currency"><code>currency</code></a>');
      expect(tagHandler(someDoc, 'link', 'module:ng.$compile')).toEqual('<a href="/api/ng/$compile"><code>$compile</code></a>');
    });
    

    it("should replace references to modules with HTML anchors to the correct url", function() {
      expect(tagHandler(someDoc, 'link', 'module:ng')).toEqual('<a href="/api/ng"><code>ng</code></a>');
      expect(tagHandler(someDoc, 'link', 'module:ngRoute')).toEqual('<a href="/api/ngRoute"><code>ngRoute</code></a>');
      expect(tagHandler(someDoc, 'link', 'module:ngSanitize')).toEqual('<a href="/api/ngSanitize"><code>ngSanitize</code></a>');
    });
    

    it("should replace references to code in other modules with HTML anchors to the correct url", function() {
      expect(tagHandler(someDoc, 'link', 'module:ngRoute.directive:ngView')).toEqual('<a href="/api/ngRoute/directive/ngView"><code>ngView</code></a>');
    });
    

    it("should replace references to code in the global namespace with HTML anchors to the correct url", function() {
      expect(tagHandler(someDoc, 'link', 'global:angular.element')).toEqual('<a href="/api/ng/global/angular.element"><code>angular.element</code></a>');
      expect(tagHandler(someDoc, 'link', 'module:ngMock.global:angular.mock.dump')).toEqual('<a href="/api/ngMock/global/angular.mock.dump"><code>angular.mock.dump</code></a>');
    });


    it("should replace code references to members of objects with HTML anchors to the correct url", function() {
      expect(tagHandler(someDoc, 'link', 'module:ng.$location#methods_search search()')).toEqual('<a href="/api/ng/$location#methods_search"><code>search()</code></a>');
    });
  });

  it("should push links into the document links property", function() {
    var someDoc = { module: 'ng', name:'ngClass', ngdoc:'directive', section: 'api' };

    tagHandler(someDoc, 'link', 'ngClass');
    expect(someDoc.links[0]).toEqual('/api/ng/directive/ngClass');

    tagHandler(someDoc, 'link', 'http://www.google.com Google');
    expect(someDoc.links[1]).toEqual('http://www.google.com');
  });

});