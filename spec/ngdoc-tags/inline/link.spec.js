var tagHandler = require('../../../lib/ngdoc-tags/inline/link.js');

describe("link inline ngdoc tag", function() {

  it("should replace urls containing slashes with HTML anchors to the same url", function() {
    var someDoc = { module: 'ng', name:'$compile' };

    expect(tagHandler(someDoc, 'link', '/some/absolute/url some link')).toEqual('<a href="/some/absolute/url">some link</a>');
    expect(tagHandler(someDoc, 'link', 'some/relative/url some other link')).toEqual('<a href="some/relative/url">some other link</a>');
    expect(tagHandler(someDoc, 'link', '../some/other/relative/url some link')).toEqual('<a href="../some/other/relative/url">some link</a>');
    expect(tagHandler(someDoc, 'link', 'http://www.google.com Google')).toEqual('<a href="http://www.google.com">Google</a>');
  });

  it("should replace references to code with HTML anchors to the correct url", function() {
    var someDoc = { module: 'ng', name:'ngClass', ngdoc:'directive' };
    expect(tagHandler(someDoc, 'link', 'ngShow')).toEqual('<a href="ngShow"><code>ngShow</code></a>')
  });

  it("should push links into the document links property", function() {
    var apiDoc = { path: 'api/ng/$compile' };

    tagHandler(apiDoc, 'link', '/api/ng/directive/ngClass');
    expect(apiDoc.links[0]).toEqual('/api/ng/directive/ngClass');

    tagHandler(apiDoc, 'link', 'http://www.google.com Google');
    expect(apiDoc.links[1]).toEqual('http://www.google.com');
  });

});