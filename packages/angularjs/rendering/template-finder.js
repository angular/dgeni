var fs = require('fs');
var _ = require('lodash');
var log = require('winston');

module.exports = function templateFinder(config) {

  if ( !config || !config.rendering || !config.rendering.templatePath || !config.rendering.templateExtension ) {
    throw new Error('Invalid configuration.  You must provide the following config properties:\n' +
      '{\n' +
      '  rendering: {\n' +
      '    templatePath: "...",\n' +
      '    templateExtension: "..."\n' +
      '  }\n' +
      '}');
  }

  var templateFolder = config.rendering.templatePath;
  var templateExtension = config.rendering.templateExtension;

  log.debug('templateFinder', templateFolder, templateExtension);

  var templateFolderPaths = fs.readdirSync(templateFolder);
  var templateMap = _.indexBy(templateFolderPaths);

  log.debug('templates found', templateMap);
        
  return function findTemplate(doc) {
    // Find the template by doc.id, then fall back to by doc.docType
    // e.g. ngAnimate.module.templates.html -> module.templates.html
    var template = templateMap[doc.id + '.' + doc.docType + '.' + templateExtension] ||
           templateMap[doc.id + '.' + templateExtension] ||
           templateMap[doc.docType + '.' + templateExtension];
    if(!template) {
      throw new Error('Unable to find a template for doc:', doc.id, doc.docType);
    }
    log.debug('found template: ', template);
    return template;
  };
};