var rewire = require('rewire');
var plugin = rewire('../../processors/examples');

describe("examples doc processor", function() {


  it("should be called examples", function() {
    expect(plugin.name).toEqual('examples');
  });


  it("should initialize an examples collection", function() {
    plugin.init();
    expect(plugin.__get__('examples')).toEqual(jasmine.any(Array));
  });


  it("should extract example tags from the doc content", function() {
    plugin.each({
      someProp: 'a b c <example name="bar1" moo1="nar1">some example content 1</example> x y z\n' +
                'a b c <example name="bar2" moo2="nar2">some example content 2</example> x y z',
      otherProp: 'j k l \n<example name="value">some content \n with newlines</example> j k l',
      exampleWithFiles: '<example name="example-with-files"><file name="app.js">aaa</file><file name="app.spec.js">bbb</file></example>'
    });
    expect(plugin.__get__('examples')).toEqual([
      { name:'bar1', moo1:'nar1', files: {} , id: 'bar1-0'},
      { name:'bar2', moo2:'nar2', files: {} , id: 'bar2-1'},
      { name:'value', files: {}, id: 'value-2' },
      { name: 'example-with-files', files: {
        'app.js': { name: 'app.js', fileContents: 'aaa' },
        'app.spec.js': { name: 'app.spec.js', fileContents: 'bbb' },
      }, id: 'example-with-files-3'}
    ]);
  });


  it("should add new documents that represent the examples", function() {
    var docs = [{
      content:
        '<example name="example-a">\n' +
          '<file type="js" name="app.js">function() { dooStuff(); }</file>\n' +
        '</example>'
    }];
    plugin.init();
    plugin.each(docs[0]);
    docs = plugin.after(docs) || docs;
  });
});