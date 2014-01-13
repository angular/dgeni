var fs = require('fs');
var _ = require('lodash');
var log = require('winston');

module.exports = function templateFinder(config) {

  var templateFolder = config.rendering.templatePath;
  var templateExtension = config.rendering.templateExtension;

  log.debug('templateFinder', templateFolder, templateExtension);

  var templateFolderPaths = fs.readdirSync(templateFolder);
  var templateMap = _.indexBy(templateFolderPaths);
        
  return function findTemplate(doc) {
    // Find the template by doc.id, then fall back to by doc.docType
    // e.g. ngAnimate.module.templates.html -> module.templates.html
    return templateMap[doc.id + '.' + doc.docType + '.' + templateExtension] ||
           templateMap[doc.docType + '.' + templateExtension];
  };
};