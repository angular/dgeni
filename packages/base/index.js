module.exports = function(config) {

  config.append('source.extractors', require('./extractors/js'));
  
  config.append('processing.processors', [
    require('./processors/doctrine-tag-parser'),
    require('./processors/doctrine-tag-extractor'),
    require('./processors/nunjucks-renderer')
  ]);
  config.append('processing.tagDefinitions', require('./tag-defs'));

  config.append('rendering.filters', [
    require('./rendering/filters/dash-case'),
    require('./rendering/filters/first-line'),
    require('./rendering/filters/json'),
    require('./rendering/filters/marked')
  ]);

  config.append('rendering.tags', [
    require('./rendering/tags/marked')
  ]);

  return config;
};