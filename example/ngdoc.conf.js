source.files.push('src');
source.files.push('content');

rendering.templatePath = 'templates';
rendering.outputPath = 'build';

rendering.extra.git = {
  tag: "v1.2.6-build.1989+sha.b0474cb"
};

logging.level = 'info';