source.files.push('src/**/*.js');
source.files.push({ pattern: '**/*.ngdoc', basePath: 'content' });

rendering.templatePath = 'templates';
rendering.templateFinder = require('./rendering/template-finder')(rendering.templatePath, '.templates.html');
rendering.outputPath = 'build';

rendering.extra.git = {
  tag: "v1.2.6-build.1989+sha.b0474cb"
};

logging.level = 'info';