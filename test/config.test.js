import {Config} from '../src/config';

describe("Config", () => {

  it("should have functions for changing properties", () => {
    var config = new Config;

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
