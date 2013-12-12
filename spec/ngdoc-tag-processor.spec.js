var ngDocTagProcessorFactory = require('../lib/ngdoc-tag-processor');

describe("ngdoc-tag-processor", function() {
  var dummyParseContent, tagHandlerSpy, processNgDocs;

  beforeEach(function() {
    dummyParseContent = function(text) { return text; };
    tagHandlerSpy = jasmine.createSpy('tagHandler').andReturn(true);

    processNgDocs = ngDocTagProcessorFactory([tagHandlerSpy], dummyParseContent);
  });

  it("should call provided tag handler functions to process tags", function() {
    processNgDocs({ content: 'some text with a\n@tag in it'});
    expect(tagHandlerSpy).toHaveBeenCalledWith(
      { name : 'tag', text : 'in it' }, 
      { content: 'some text with a\n@tag in it'},
      undefined,
      dummyParseContent
      );
  });
});