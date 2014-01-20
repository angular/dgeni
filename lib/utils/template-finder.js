var _ = require('lodash');
var log = require('winston');
var path = require('canonical-path');
var glob = require('glob');

module.exports = function templateFinder(config) {

  if ( !config || !config.rendering || !config.rendering.templateFolder || !config.rendering.templatePatterns ) {
    throw new Error('Invalid configuration.  You must provide the following config properties:\n' +
      '{\n' +
      '  rendering: {\n' +
      '    templateFolder: "...",\n' +
      '    templatePatterns: [ ... ]\n' +
      '  }\n' +
      '}');
  }

  var templates = _.indexBy(glob.sync(path.join(config.rendering.templateFolder, '**/*')));

  var patterns = _.map(config.rendering.templatePatterns, function(pattern) {
    // Here we use the lodash micro templating.
    // The document will be available to the template as a `doc` variable
    return _.template(pattern, null, { variable: 'doc' });
  });

  return function findTemplate(doc) {
    var templatePath;

    _.find(patterns, function(pattern) {
      templatePath = templates[pattern(doc)];
      return templatePath;
    });

    if ( !templatePath ) {
      throw new Error('No template found for "' + (doc.id || doc.name || doc.docType) + '" document.');
    }

    // return an array of promises to templates that have been found for this doc and set of patterns
    return templatePath;
  };
};