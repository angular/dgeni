var ngDocProcessorFactory = require('../lib/ngdoc');

describe("ngdoc", function() {
  var tagHandlerSpy, inlineTagHandlerSpy, processDoc;

  beforeEach(function() {
    tagHandlerSpy = jasmine.createSpy('tagHandler').andReturn(true);
    inlineTagHandlerSpy = jasmine.createSpy('inlineTagHandler').andReturn(true);
    pluginSpy = jasmine.createSpyObj('pluginSpy', ['before', 'after']);

    processDoc = ngDocProcessorFactory([tagHandlerSpy], [inlineTagHandlerSpy], [pluginSpy]);
  });

  it("should call provided tag handler functions to process tags", function() {
    var doc = { content: 'some text with a\n@tag in it'};
    processDoc(doc);
    expect(tagHandlerSpy).toHaveBeenCalledWith(
      { name : 'tag', text : 'in it', lines : ['in it'] }, 
      doc);
  });

  it("should call the inline tag handlers if an inline tag is found", function() {
    doc = { content: '@tag containing an {@inline tag} within'};
    processDoc(doc);
    expect(inlineTagHandlerSpy).toHaveBeenCalledWith(doc, 'inline', 'tag');
  });

  it("should call the plugins before and after parsing", function() {
    doc = { content: 'xxx' };
    processDoc(doc);
    expect(pluginSpy.before).toHaveBeenCalledWith(doc);
    expect(pluginSpy.after).toHaveBeenCalledWith(doc);
  });
});