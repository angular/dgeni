var parser = require('../../lib/content-parsers/link.js');

describe("content-parsers/link", function() {

  it("should replace {@link } directives with HTML anchors", function() {
    var apiDoc = { section: 'api', file: '' };
    var guideDoc = { section: 'guide' };
    expect(parser('{@link guide/compiler#frag some link}', guideDoc)).toEqual('<a href="guide/compiler#frag">some link</a>');
    expect(parser('{@link ng/directive/ngClass}', apiDoc)).toEqual('<a href="api/ng/directive/ngClass"><code>ngClass</code></a>');
  });
  it("should push a link into the document links property", function() {
    var apiDoc = { section: 'api' };
    parser('{@link ng/directive/ngClass}', apiDoc);
    expect(apiDoc.links.length).toEqual(1);
    expect(apiDoc.links[0]).toEqual('api/ng/directive/ngClass');
  });
});