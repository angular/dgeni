var ngDocProcessorFactory = require('../../lib/ngdoc-parser');

describe("ngdoc", function() {
  var tagHandlerSpy, inlineTagHandlerSpy, processDoc;

  beforeEach(function() {
    function log(doc, val) {
      if ( doc.log ) { doc.log.push(val); }
    }

    tagHandlerSpy = jasmine.createSpy('tagHandler').andCallFake(function(tag, doc) { log(doc, 'TAG'); return true;});
    inlineTagHandlerSpy = jasmine.createSpy('inlineTagHandler').andCallFake(function(doc) { log(doc, 'INLINE_TAG'); return 'inline tag';});
    pluginSpy = jasmine.createSpyObj('pluginSpy', ['before', 'after']);
    pluginSpy.before.andCallFake(function(doc) { log(doc, 'PLUGIN-BEFORE'); });
    pluginSpy.after.andCallFake(function(doc) { log(doc, 'PLUGIN-AFTER'); });

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
    doc = { content: '@tag containing an {@inline inline tag content} within'};
    processDoc(doc);
    expect(inlineTagHandlerSpy).toHaveBeenCalledWith(doc, 'inline', 'inline tag content');

    doc = { content: '@tag containing an {@inline} within'};
    processDoc(doc);
    expect(inlineTagHandlerSpy).toHaveBeenCalledWith(doc, 'inline', '');

    doc = { content: '@tag containing an {@inline `unusual chars`} within'};
    processDoc(doc);
    expect(inlineTagHandlerSpy).toHaveBeenCalledWith(doc, 'inline', '`unusual chars`');
  });

  it("should call the tag handlers and plugins in the right order", function() {
    doc = { content: '@tag {@inline}', log: [] };
    processDoc(doc);
    expect(doc.log).toEqual(['PLUGIN-BEFORE', 'TAG', 'PLUGIN-AFTER', 'INLINE_TAG']);
  });

  it("should call the plugins before and after parsing", function() {
    doc = { content: 'xxx' };
    processDoc(doc);
    expect(pluginSpy.before).toHaveBeenCalledWith(doc);
    expect(pluginSpy.after).toHaveBeenCalledWith(doc);
  });
});