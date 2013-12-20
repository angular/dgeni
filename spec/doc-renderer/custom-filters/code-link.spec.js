var filter = require('../../../lib/doc-renderer/custom-filters/code-link');

describe("code-link filter", function() {

  it("should have the name 'codeLink'", function() {
    expect(filter.name).toEqual('codeLink');
  });

  it("should return an HTML anchor for a code reference", function() {
    var doc = { section: 'api', module: 'ng', ngdoc: 'directive', name: 'ngShow'};
    expect(filter.process('ngClass', doc)).toEqual('<a href="/api/ng/directive/ngClass"><p><code>ngClass</code></p></a>');
    expect(filter.process('module:ngRoute.$route', doc)).toEqual('<a href="/api/ngRoute/$route"><p><code>$route</code></p></a>');

    expect(filter.process('ngClass', doc, 'some title')).toEqual('<a href="/api/ng/directive/ngClass"><p><code>some title</code></p></a>');
    expect(filter.process('module:ngRoute.$route', doc, 'some title')).toEqual('<a href="/api/ngRoute/$route"><p><code>some title</code></p></a>');
  });

  it("should return an HTML anchor for a url", function() {
    var doc = { section: 'api', module: 'ng', ngdoc: 'directive', name: 'ngShow'};
    expect(filter.process('/guide/directives', doc)).toEqual('<a href="/guide/directives">directives</a>');
    expect(filter.process('/tutorial/step-1', doc, 'Step 1')).toEqual('<a href="/tutorial/step-1">Step 1</a>');
  });
});