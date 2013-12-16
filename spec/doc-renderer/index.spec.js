var rewire = require('rewire');
var docRendererFactory = rewire('../../lib/doc-renderer');

describe("doc-renderer", function() {
  it("should configure marked and nunjucks", function() {

    var nunjucks = docRendererFactory.__get__('nunjucks');
    spyOn(nunjucks, 'configure').andCallThrough();

    var marked = docRendererFactory.__get__('marked');
    spyOn(marked, 'setOptions').andCallThrough();

    docRendererFactory('templates', 'output');

    expect(nunjucks.configure).toHaveBeenCalledWith('templates', {
      tags: {
        variableStart: '{$',
        variableEnd: '$}'
      }
    });

    expect(marked.setOptions).toHaveBeenCalledWith({
    gfm: true,
    tables: true,
    highlight: jasmine.any(Function),
    langPrefix: 'prettyprint linenum lang-'
  });
  });
});