var tagHandler = require('../../../lib/ngdoc-tags/inline/link.js');

describe("link inline ngdoc tag", function() {

  it("should replace urls containing slashes with HTML anchors to the same url", function() {
    var someDoc = { };

    expect(tagHandler(someDoc, 'link', '/some/absolute/url some link')).toEqual('<a href="/some/absolute/url">some link</a>');
    expect(tagHandler(someDoc, 'link', 'some/relative/url some other link')).toEqual('<a href="some/relative/url">some other link</a>');
    expect(tagHandler(someDoc, 'link', '../some/other/relative/url some link')).toEqual('<a href="../some/other/relative/url">some link</a>');
    expect(tagHandler(someDoc, 'link', 'http://www.google.com Google')).toEqual('<a href="http://www.google.com">Google</a>');
  });

  it("should replace references to code with HTML anchors to the correct url", function() {
    var someDoc = { module: 'ng', name:'ngClass', ngdoc:'directive', section: 'api' };

    expect(tagHandler(someDoc, 'link', 'ngShow')).toEqual('<a href="/api/ng/directive/ngShow"><code>ngShow</code></a>');
    expect(tagHandler(someDoc, 'link', 'directive:ngShow')).toEqual('<a href="/api/ng/directive/ngShow"><code>ngShow</code></a>');

    expect(tagHandler(someDoc, 'link', 'input[checkbox]')).toEqual('<a href="/api/ng/directive/input[checkbox]"><code>input[checkbox]</code></a>');
    expect(tagHandler(someDoc, 'link', 'filter:currency')).toEqual('<a href="/api/ng/filter/currency"><code>currency</code></a>');
    expect(tagHandler(someDoc, 'link', 'module:ng.$compile')).toEqual('<a href="/api/ng/$compile"><code>$compile</code></a>');

    expect(tagHandler(someDoc, 'link', 'module:ngRoute')).toEqual('<a href="/api/ngRoute"><code>ngRoute</code></a>');
    expect(tagHandler(someDoc, 'link', 'module:ngRoute.directive:ngView')).toEqual('<a href="/api/ngRoute/directive/ngView"><code>ngView</code></a>');

    expect(tagHandler(someDoc, 'link', 'global:angular.element')).toEqual('<a href="/api/angular.element"><code>angular.element</code></a>');
  });

  it("should push links into the document links property", function() {
    var someDoc = { module: 'ng', name:'ngClass', ngdoc:'directive', section: 'api' };

    tagHandler(someDoc, 'link', 'ngClass');
    expect(someDoc.links[0]).toEqual('/api/ng/directive/ngClass');

    tagHandler(someDoc, 'link', 'http://www.google.com Google');
    expect(someDoc.links[1]).toEqual('http://www.google.com');
  });

});