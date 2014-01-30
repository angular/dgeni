var rewire = require('rewire');
var plugin = rewire('../../processors/examples');
var configurer = require('../../../../lib/utils/config');
var log = require('winston');

describe("examples doc processor", function() {

  beforeEach(function() {
    log.level = 'error';
    plugin.init(configurer.load());
  });

  it("should be called examples", function() {
    expect(plugin.name).toEqual('examples');
  });


  it("should initialize an examples collection", function() {
    expect(plugin.__get__('examples')).toEqual(jasmine.any(Array));
  });


  it("should extract example tags from the doc content", function() {
    plugin.each({
      content: 'a b c <example name="bar" moo1="nar1">some example content 1</example> x y z\n' +
                'a b c <example name="bar" moo2="nar2">some example content 2</example> x y z'
    });
    plugin.each({
      content: 'j k l \n<example name="value">some content \n with newlines</example> j k l'
    });
    plugin.each({
      content: '<example name="example-with-files"><file name="app.js">aaa</file><file name="app.spec.js" type="spec">bbb</file></example>'
    });
    var examples = plugin.__get__('examples');
    expect(examples[0]).toEqual(jasmine.objectContaining({ name:'bar', moo1:'nar1', files: {} , id: 'bar'}));
    expect(examples[1]).toEqual(jasmine.objectContaining({ name:'bar', moo2:'nar2', files: {} , id: 'bar1'}));
    expect(examples[2]).toEqual(jasmine.objectContaining({ name:'value', files: {}, id: 'value'}));
    expect(examples[3]).toEqual(jasmine.objectContaining({
      name: 'example-with-files',
      files: {
        'app.js': { name: 'app.js', fileContents: 'aaa', type: 'js' },
        'app.spec.js': { name: 'app.spec.js', fileContents: 'bbb', type: 'spec' },
      },
      id: 'example-with-files'
    }));
  });


  it("should compute unique ids for each example", function() {
    plugin.each({
      content: '<example name="bar">some example content 1</example>\n' +
                    '<example name="bar">some example content 2</example>'
    });
    var examples = plugin.__get__('examples');
    expect(examples[0].id).toEqual('bar');
    expect(examples[1].id).toEqual('bar1');
  });

  it("should inject the computed example id into the original markup to be used by the template", function() {
    doc = {
      content: '<example name="bar">some example content 1</example>\n' +
                    '<example name="bar">some example content 2</example>'
    };

    plugin.each(doc);

    expect(doc.content).toEqual('<example id="bar" name="bar">some example content 1</example>\n' +
                    '<example id="bar1" name="bar">some example content 2</example>');

  });


  it("should add new documents that represent the examples", function() {
    var docs = [{
      docType: 'directive',
      content:
        '<example name="example-a">\n' +
          '<file name="app.js">function() { dooStuff(); }</file>\n' +
          '<file name="app.css">div.red: { color: red; }</file>\n' +
          '<file type="spec" name="appSpec.js">describe("some thing", function() { ... });</file>\n' +
        '</example>'
    }];
    plugin.each(docs[0]);
    docs = plugin.after(docs) || docs;
    expect(docs[0]).toEqual(
      jasmine.objectContaining({ docType: 'directive' })
    );
    expect(docs[1]).toEqual(
      jasmine.objectContaining({ docType: 'example', template: 'examples/index.template.html' })
    );
    expect(docs[2]).toEqual(
      jasmine.objectContaining({ docType: 'example-js', template: 'examples/template.js' })
    );
    expect(docs[3]).toEqual(
      jasmine.objectContaining({ docType: 'example-css', template: 'examples/template.css' })
    );
    expect(docs[4]).toEqual(
      jasmine.objectContaining({ docType: 'example-spec', template: 'examples/template.spec' })
    );
  });
});