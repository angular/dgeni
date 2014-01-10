var rewire = require('rewire');
var docRendererFactory = rewire('../lib/doc-renderer');

describe("doc-renderer", function() {
  var nunjucks, nunjucksEnvMock, templateFinder;

  beforeEach(function() {
    nunjucks = docRendererFactory.__get__('nunjucks');
    nunjucksEnvMock = jasmine.createSpyObj('nunjucksEnv', ['addFilter', 'addExtension']);
    spyOn(nunjucks, 'configure').andReturn( nunjucksEnvMock );
    templateFinder = jasmine.createSpy('templateFinder');
  });

  it("should configure nunjucks", function() {


    docRendererFactory('templates', 'output', templateFinder);

    expect(nunjucks.configure).toHaveBeenCalledWith('templates', {
      tags: {
        variableStart: '{$',
        variableEnd: '$}'
      }
    });
  });

  it("should load the given custom filters and tags", function() {

    var dummyFilter = { name: 'test', process: function() {} }, dummyExtension = { tags: ['dummy']};

    docRendererFactory('templates', 'output', templateFinder, [dummyFilter], [dummyExtension]);

    expect(nunjucksEnvMock.addFilter).toHaveBeenCalledWith(dummyFilter.name, dummyFilter.process);
    expect(nunjucksEnvMock.addExtension).toHaveBeenCalledWith('dummy', dummyExtension);
  });
});