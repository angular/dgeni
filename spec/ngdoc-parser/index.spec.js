var ngDocProcessorFactory = require('../../lib/ngdoc-parser');

describe("ngdoc", function() {
  var tagHandlerSpy, inlineTagHandlerSpy, processDoc;

  beforeEach(function() {
    function log(doc, val) {
      if ( doc.log ) { doc.log.push(val); }
    }

    tagHandlerSpy = jasmine.createSpy('tagHandler').andCallFake(function(tag) { log(tag.doc, 'TAG'); tag.doc.tagContent = tag.text; return true;});
    inlineTagHandlerSpy = jasmine.createSpy('inlineTagHandler').andCallFake(function(tag) { log(tag.doc, 'INLINE_TAG'); return function getText() { return 'PROCESSED TAG'; };} );
    pluginSpy = jasmine.createSpyObj('pluginSpy', ['before', 'after']);
    pluginSpy.before.andCallFake(function(doc) { log(doc, 'PLUGIN-BEFORE'); });
    pluginSpy.after.andCallFake(function(doc) { log(doc, 'PLUGIN-AFTER'); });

    processDoc = ngDocProcessorFactory([tagHandlerSpy], [inlineTagHandlerSpy], [pluginSpy]);
  });

  it("should call provided tag handler functions to process tags", function() {
    var doc = { content: 'some text with a\n@tag in it'};
    processDoc(doc);
    expect(tagHandlerSpy).toHaveBeenCalledWith({ doc: doc, name : 'tag', text : 'in it' });
  });

  it("should split string properties that contain inline tags into arrays", function() {
    doc = { content: '@tag containing an {@inline inline tag} inside it'};
    processDoc(doc);
    expect(doc.tagContent).toEqual('containing an PROCESSED TAG inside it');
  });

  it("should call the inline tag handlers if an inline tag is found", function() {
    doc = { content: '@tag containing an {@inline inline tag content} within'};
    var expectedTag = {
      doc: doc,
      name: 'tag',
      text : jasmine.any(Function)
    };
    processDoc(doc);
    expect(inlineTagHandlerSpy).toHaveBeenCalledWith(expectedTag, 'inline', 'inline tag content' );

    doc = { content: '@tag containing an {@inline} within'};
    expectedTag = {
      doc: doc,
      name: 'tag',
      text : jasmine.any(Function)
    };
    processDoc(doc);
    expect(inlineTagHandlerSpy).toHaveBeenCalledWith(expectedTag, 'inline', '');

    doc = { content: '@tag containing an {@inline `unusual chars`} within'};
    expectedTag = {
      doc: doc,
      name: 'tag',
      text : jasmine.any(Function)
    };
    processDoc(doc);
    expect(inlineTagHandlerSpy).toHaveBeenCalledWith(expectedTag, 'inline', '`unusual chars`');
  });

  it("should call the tag handlers and plugins in the right order", function() {
    doc = { content: '@tag {@inline}', log: [] };
    processDoc(doc);
    expect(doc.log).toEqual(['PLUGIN-BEFORE', 'INLINE_TAG', 'TAG', 'PLUGIN-AFTER']);
  });

  it("should call the plugins before and after parsing", function() {
    doc = { content: 'xxx' };
    processDoc(doc);
    expect(pluginSpy.before).toHaveBeenCalledWith(doc);
    expect(pluginSpy.after).toHaveBeenCalledWith(doc);
  });
});