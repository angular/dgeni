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
      someProp: 'a b c <example foo1="bar1" moo1="nar1">some example content 1</example> x y z\n' +
                'a b c <example foo2="bar2" moo2="nar2">some example content 2</example> x y z',
      otherProp: 'j k l \n<example other="value">some content \n with newlines</example> j k l'
    });
    expect(plugin.__get__('examples')).toEqual([
      { foo1:'bar1', moo1:'nar1', files: {} , id: 0},
      { foo2:'bar2', moo2:'nar2', files: {} , id: 1},
      { other:'value', files: {}, id: 2 }
    ]);
  });
});