var _ = require('lodash');
var path = require('canonical-path');
var Q = require('q');
var nunjucks = require('nunjucks');
var log = require('winston');
var writer = require('./utils/doc-writer');
var templateFinderFactory = require('./utils/template-finder');

module.exports = function docRendererFactory(config) {

  if ( !config || !config.rendering || !config.rendering.templateFolder) {
    throw new Error('Invalid configuration: ' + config);
  }

  var templateFinder = templateFinderFactory(config);

  // Lets use {$ $} for nunjucks interpolation rather than {{ }}, which conflicts with AngularJS
  var env = nunjucks.configure(config.rendering.templateFolder, {
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
      var data, res, outputPath, err;
      try {
        data = _.defaults({}, { doc: doc, docs: docs }, extraData, helpers);
        outputPath = path.resolve(config.rendering.outputPath, doc.outputPath);
        var templateFile = templateFinder(data.doc);
        res = nunjucks.render(templateFile, data);

        log.info('outputPath', doc.outputPath, outputPath);

        fileWritePromises.push(writer.writeFile(outputPath, res).then(function() {
          log.debug('Rendered doc', outputPath);
          return outputPath;
        }));
      } catch(ex) {
        throw new Error('Failed to render doc "' + doc.id + '"from file "' + doc.file + '" line ' + doc.startingLine + '\n Error Message follows:\n' + ex.stack);
      }
      
    });

    return Q.all(fileWritePromises);
  };

};