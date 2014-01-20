var rewire = require('rewire');
var docRendererFactory = rewire('../lib/doc-renderer');

describe("doc-renderer", function() {
  var nunjucks, nunjucksEnvMock;

  beforeEach(function() {
    nunjucks = docRendererFactory.__get__('nunjucks');
    nunjucksEnvMock = jasmine.createSpyObj('nunjucksEnv', ['addFilter', 'addExtension']);
    spyOn(nunjucks, 'configure').andReturn( nunjucksEnvMock );
  });

  it("should configure nunjucks", function() {


    docRendererFactory({ rendering: { templateFolder: 'templates', templatePatterns: [], outputFolder: 'output' }});

    expect(nunjucks.configure).toHaveBeenCalledWith('templates', {
      tags: {
        variableStart: '{$',
        variableEnd: '$}'
      }
    });
  });

  it("should load the given custom filters and tags", function() {

    var dummyFilter = { name: 'test', process: function() {} }, dummyExtension = { tags: ['dummy']};

    docRendererFactory({ rendering: { templateFolder: 'templates', templatePatterns: [], outputFolder: 'output', filters: [dummyFilter],  tags: [dummyExtension] } });

    expect(nunjucksEnvMock.addFilter).toHaveBeenCalledWith(dummyFilter.name, dummyFilter.process);
    expect(nunjucksEnvMock.addExtension).toHaveBeenCalledWith('dummy', dummyExtension);
  });
});