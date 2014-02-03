var rewire = require('rewire');
var plugin = rewire('../../processors/parse-examples');
var configurer = require('../../../../lib/utils/config');
var log = require('winston');

describe("parse-examples doc processor", function() {

  beforeEach(function() {
    var injectables = { value: function() { } };
    log.level = 'error';
    plugin.init(configurer.load(), injectables);
  });

  it("should be called examples", function() {
    expect(plugin.name).toEqual('parse-examples');
  });


  it("should extract example tags from the doc content", function() {
    var examples = [];
    plugin.process([
    {
      content: 'a b c <example name="bar" moo1="nar1">some example content 1</example> x y z\n' +
                'a b c <example name="bar" moo2="nar2">some example content 2</example> x y z'
    },
    {
      content: 'j k l \n<example name="value">some content \n with newlines</example> j k l'
    },
    {
      content: '<example name="with-files"><file name="app.js">aaa</file><file name="app.spec.js" type="spec">bbb</file></example>'
    }], examples);
    expect(examples[0]).toEqual(jasmine.objectContaining({ name:'bar', moo1:'nar1', files: {} , id: 'example-bar'}));
    expect(examples[1]).toEqual(jasmine.objectContaining({ name:'bar', moo2:'nar2', files: {} , id: 'example-bar1'}));
    expect(examples[2]).toEqual(jasmine.objectContaining({ name:'value', files: {}, id: 'example-value'}));
    expect(examples[3]).toEqual(jasmine.objectContaining({
      name: 'with-files',
      files: {
        'app.js': { name: 'app.js', fileContents: 'aaa', language: 'js', type: 'js' },
        'app.spec.js': { name: 'app.spec.js', fileContents: 'bbb', language: 'js', type: 'spec' },
      },
      id: 'example-with-files'
    }));
  });


  it("should compute unique ids for each example", function() {
    var examples = [];
    plugin.process([{
      content: '<example name="bar">some example content 1</example>\n' +
                    '<example name="bar">some example content 2</example>'
    }], examples);
    expect(examples[0].id).toEqual('example-bar');
    expect(examples[1].id).toEqual('example-bar1');
  });

  it("should inject a new set of elements in place of the example into the original markup to be used by the template", function() {
    doc = {
      content: '<example name="bar">some example content 1</example>'
    };

    plugin.process([doc], []);

    expect(doc.content).toMatch('<div class="runnable-example" name="bar" id="example-bar" outputPath="examples/example-bar/index.html">');
    expect(doc.content).toMatch('<iframe class="runnable-example-frame" src="examples/example-bar/index.html" name="example-bar"></iframe>');

  });

});