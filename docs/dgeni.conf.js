var path = require('canonical-path');
var Package = require('dgeni').Package;

module.exports = new Package('dgeniDocsPackage', [require('dgeni-packages/jsdoc')])
  .config(function(log, readFilesProcessor, renderDocsProcessor) {
    var basePath = path.resolve(__dirname);

    readFilesProcessor.projectPath = basePath;
    readFilesProcessor.sourceFiles.push({ pattern: '../lib/**/*.js', basePath: basePath });

    renderDocsProcessor.outputFolder = 'build';
    renderDocsProcessor.contentsFolder = 'docs';

    log.level = 'debug';
  });