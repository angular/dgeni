var rewire = require('rewire');
var docRendererFactory = rewire('../lib/doc-renderer');

describe("doc-renderer", function() {
  var nunjucks, addFilterSpy, addExtensionSpy;

  beforeEach(function() {
    nunjucks = docRendererFactory.__get__('nunjucks');
    addFilterSpy = jasmine.createSpy('addFilter');
    addExtensionSpy = jasmine.createSpy('addExtension');

    nunjucks.Environment = jasmine.createSpy('Environment');
    nunjucks.Environment.prototype.addFilter = addFilterSpy;
    nunjucks.Environment.prototype.addExtension = addExtensionSpy;
  });

  it("should configure nunjucks", function() {


    docRendererFactory({ basePath: '/', rendering: { templateFolders: ['templates'], templatePatterns: [], outputFolder: 'output' }});

    expect(nunjucks.Environment).toHaveBeenCalledWith(jasmine.any(nunjucks.FileSystemLoader), {
      tags: {
        variableStart: '{$',
        variableEnd: '$}'
      }
    });
  });

  it("should load the given custom filters and tags", function() {

    var dummyFilter = { name: 'test', process: function() {} }, dummyExtension = { tags: ['dummy']};

    docRendererFactory({ basePath: '/', rendering: { templateFolders: ['templates'], templatePatterns: [], outputFolder: 'output', filters: [dummyFilter],  tags: [dummyExtension] } });

    expect(addFilterSpy).toHaveBeenCalledWith(dummyFilter.name, dummyFilter.process);
    expect(addExtensionSpy).toHaveBeenCalledWith('dummy', dummyExtension);
  });
});