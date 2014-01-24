var _ = require('lodash');
var path = require('canonical-path');
var Q = require('q');
var nunjucks = require('nunjucks');
var log = require('winston');
var writer = require('./utils/doc-writer');
var templateFinderFactory = require('./utils/template-finder');

module.exports = function docRendererFactory(config) {

  if ( !config ) {
    throw new Error('Configuration missing.  Please provide a valid configuration object');
  }
  if ( !config.basePath ) {
    throw new Error('Invalid configuration: You must provide a basePath in the configuration object');
  }
  if ( !config.rendering || !config.rendering.templateFolders || !config.rendering.outputFolder ) {
    throw new Error('Invalid configuration: You must provide a valid config.rendering object');
  }

  // Resolve the paths to the templates and output folder
  config.rendering.templateFolders = _.map(config.rendering.templateFolders, function(templateFolder) {
    return path.resolve(config.basePath, templateFolder);
  });
  config.rendering.outputFolder = path.resolve(config.basePath, config.rendering.outputFolder);

  var templateFinder = templateFinderFactory(config);

  // Lets use {$ $} for nunjucks interpolation rather than {{ }}, which conflicts with AngularJS
  var env = nunjucks.configure(config.rendering.templateFolders, {
    tags: {
      variableStart: '{$',
      variableEnd: '$}'
    }
  });


  // Configure nunjucks with the custom filters
  _.forEach(config.rendering.filters, function(filter) {
    env.addFilter(filter.name, filter.process);
  });


  // Configure nunjucks with the custom tags
  _.forEach(config.rendering.tags, function(tag) {
    env.addExtension(tag.tags[0], tag);
  });

  // Extract any extra helper functions/data from the config
  var helpers = _.defaults({}, config.helpers);

  /**
   * Render the set of documents to the output folder and extra data, using the templates found in the given folder
   * @param  {object} doc          The document to render
   * @param  {object} extraData        Extra data to make available to the rendering
   * @returns {promise}            A promise to each of the output paths, resolved when all the docs have
   *                               been rendered and output
   */
  return function render(docs, extraData) {
    var fileWritePromises = [];
    
    _.forEach(docs, function(doc) {
      var data, res, outputFile, err;
      if ( !doc.outputPath ) {
        throw new Error('Invalid document "' + doc.id + '" - this document has no outputPath.');
      }
      try {
        data = _.defaults({}, { doc: doc, docs: docs }, extraData, helpers);
        outputFile = path.resolve(config.rendering.outputFolder, doc.outputPath);
        var templateFile = templateFinder(data.doc);
        res = nunjucks.render(templateFile, data);

        log.debug('outputFile', doc.outputPath, outputFile);

        fileWritePromises.push(writer.writeFile(outputFile, res).then(function() {
          log.debug('Rendered doc', outputFile);
          return outputFile;
        }));
      } catch(ex) {
        throw new Error('Failed to render doc "' + doc.id + '" from file "' + doc.file + '" line ' + doc.startingLine + '\n Error Message follows:\n' + ex.stack);
      }
      
    });

    return Q.all(fileWritePromises);
  };

};