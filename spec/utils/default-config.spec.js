var config = require('../../lib/utils/default-config');
describe("default-config utility", function() {
  it("should have some default values", function() {
    expect(config.source).toEqual({
      files : [],
      extractors: []
    });

    expect(config.processing).toEqual({
      tagParser: null,
      processors: [],
      tagDefinitions: []
    });

    expect(config.rendering).toEqual({
      templateFolders: [],
      patterns: [],
      filters: [],
      tags: []
    });

    expect(config.logging).toEqual({
      level: 'info'
    });
  });

  it("should have functions for changing properties", function() {
    config.set('logging.level', 'debug');
    expect(config.logging.level).toEqual('debug');

    config.append('source.extractors', 'a');
    expect(config.source.extractors).toEqual(['a']);

    config.append('source.extractors', ['x', 'y']);
    expect(config.source.extractors).toEqual(['a', 'x', 'y']);

    config.append('other.newArray', 'a');
    expect(config.other.newArray).toEqual(['a']);

    config.prepend('rendering.templateFolders', ['x', 'y']);
    expect(config.rendering.templateFolders).toEqual(['x', 'y']);

    config.prepend('rendering.templateFolders', ['a', 'b']);
    expect(config.rendering.templateFolders).toEqual(['a', 'b', 'x', 'y']);

    config.prepend('other.newArray2', 'x');
    expect(config.other.newArray2).toEqual(['x']);

    config.set('some.extra.property', 'value');
    expect(config.some.extra.property).toEqual('value');

    config.merge('some.extra', { foo: 'bar' });
    expect(config.some.extra).toEqual({
      property: 'value',
      foo: 'bar'
    });

  });
});