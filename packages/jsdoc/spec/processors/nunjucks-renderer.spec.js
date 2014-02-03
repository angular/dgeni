var rewire = require('rewire');
var plugin = rewire('../../processors/nunjucks-renderer');

describe("doc-renderer", function() {
  var nunjucks, addFilterSpy, addExtensionSpy, injectables;

  beforeEach(function() {
    injectables = jasmine.createSpyObj('injectables', ['value']);
    nunjucks = plugin.__get__('nunjucks');
    addFilterSpy = jasmine.createSpy('addFilter');
    addExtensionSpy = jasmine.createSpy('addExtension');

    nunjucks.Environment = jasmine.createSpy('Environment');
    nunjucks.Environment.prototype.addFilter = addFilterSpy;
    nunjucks.Environment.prototype.addExtension = addExtensionSpy;
  });

  it("should configure nunjucks", function() {


    plugin.init({ basePath: '/', rendering: { templateFolders: ['templates'], templatePatterns: [], outputFolder: 'output' }}, injectables);

    expect(nunjucks.Environment).toHaveBeenCalledWith(jasmine.any(nunjucks.FileSystemLoader), {
      tags: {
        variableStart: '{$',
        variableEnd: '$}'
      }
    });
  });

  it("should load the given custom filters and tags", function() {

    var dummyFilter = { name: 'test', process: function() {} }, dummyExtension = { tags: ['dummy']};

    plugin.init({ basePath: '/', rendering: { templateFolders: ['templates'], templatePatterns: [], outputFolder: 'output', filters: [dummyFilter],  tags: [dummyExtension] } }, injectables);

    expect(addFilterSpy).toHaveBeenCalledWith(dummyFilter.name, dummyFilter.process);
    expect(addExtensionSpy).toHaveBeenCalledWith('dummy', dummyExtension);
  });
});