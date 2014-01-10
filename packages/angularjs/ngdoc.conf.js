source.files.push({ pattern: 'example/src/**/*.js', basePath: 'example' });
source.files.push({ pattern: 'example/content/**/*.ngdoc', basePath: 'example/content' });
source.extractors = require('./extractors');

processing.tagParser = require('../default/processors/doctrine-tag-parser');
processing.plugins = require('./processors');
processing.tagDefinitions = require('./tag-defs');

rendering.templatePath = 'templates';
rendering.templateFinder = require('./rendering/template-finder')(rendering.templatePath, '.templates.html');
rendering.filters = require('./rendering/filters');
rendering.tags = require('./rendering/tags');
rendering.outputPath = 'build';

rendering.extra.git = {
  tag: "v1.2.6-build.1989+sha.b0474cb"
};

logging.level = 'info';