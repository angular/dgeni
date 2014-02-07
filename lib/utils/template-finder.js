var _ = require('lodash');
var log = require('winston');
var path = require('canonical-path');
var glob = require('glob');

module.exports = function templateFinder(config) {

  if ( !config || !config.rendering || !config.rendering.templateFolders || !config.rendering.templatePatterns ) {
    throw new Error('Invalid configuration.  You must provide the following config properties:\n' +
      '{\n' +
      '  rendering: {\n' +
      '    templateFolders: [ ... ],\n' +
      '    templatePatterns: [ ... ]\n' +
      '  }\n' +
      '}');
  }

  // Compile each of the patterns and store them for later
  var patterns = _.map(config.rendering.templatePatterns, function(pattern) {
    
    // Here we use the lodash micro templating.
    // The document will be available to the micro template as a `doc` variable
    return _.template(pattern, null, { variable: 'doc' });
  });

  // Traverse each templateFolder and store an index of the files found for later
  var templateSets = _.map(config.rendering.templateFolders, function(templateFolder) {
    return {
      templateFolder: templateFolder,
      templates: _.indexBy(glob.sync('**/*', { cwd: templateFolder }))
    };
  });


  // The function that will find a template for a given doc
  return function findTemplate(doc) {
    var templatePath;

    // Search the template sets for a matching pattern for the given doc
    _.any(templateSets, function(templateSet) {
      return _.any(patterns, function(pattern) {
        log.silly('looking for ', pattern(doc));
        templatePath = templateSet.templates[pattern(doc)];
        if ( templatePath ) {
          log.debug('template found', path.resolve(templateSet.templateFolder, templatePath));
          return true;
        }
      });
    });

    if ( !templatePath ) {
      throw new Error(
        'No template found for "' + (doc.id || doc.name || doc.docType) + '" document.\n' +
        'The following template patterns were tried:\n' +
        _.reduce(patterns, function(str, pattern) {
          return str + '  "' + pattern(doc) + '"\n';
        }, '') +
        'The following folders were searched:\n' +
        _.reduce(templateSets, function(str, templateSet) {
          return str + '  "' + templateSet.templateFolder + '"\n';
        }, '')
      );
    }


    // return an array of promises to templates that have been found for this doc and set of patterns
    return templatePath;
  };
};