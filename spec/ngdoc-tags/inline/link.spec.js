var tagHandler = require('../../../lib/ngdoc-tags/inline/link.js');

xdescribe("content-tagHandlers/link", function() {

  it("should replace absolute links with HTML anchors", function() {
    var apiDoc = { path: 'api/ng/$compile' };

    expect(tagHandler(apiDoc, 'link', '/guide/compiler#frag some link')).toEqual('<a href="/guide/compiler#frag">some link</a>');

    expect(tagHandler(apiDoc, 'link', '/api/ng/directive/ngClass')).toEqual('<a href="/api/ng/directive/ngClass"><code>ngClass</code></a>');

    expect(tagHandler(apiDoc, 'link', 'http://www.google.com Google')).toEqual('<a href="http://www.google.com">Google</a>');
  });

  it("should replace relative links with HTML anchors based on the current doc path", function() {
    var apiDoc = { path: 'api/ng/$compile' };
    var guideDoc = { path: 'guide/directives' };

  });

  it("should push links into the document links property", function() {
    var apiDoc = { path: 'api/ng/$compile' };

    tagHandler(apiDoc, 'link', '/api/ng/directive/ngClass');
    expect(apiDoc.links[0]).toEqual('/api/ng/directive/ngClass');

    tagHandler(apiDoc, 'link', 'http://www.google.com Google');
    expect(apiDoc.links[1]).toEqual('http://www.google.com');
  });

});