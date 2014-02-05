var _ = require('lodash');
var path = require('canonical-path');
var Q = require('q');
var nunjucks = require('nunjucks');
var log = require('winston');
var writer = require('../../../lib/utils/doc-writer');
var templateFinderFactory = require('../../../lib/utils/template-finder');
var env, helpers;

var plugin = module.exports = {
  name: 'nunjucks-renderer',
  runAfter: ['rendering-docs'],
  runBefore: ['docs-rendered'],
  init: function initialize(config, injectables) {

    if ( !config.basePath ) {
      throw new Error('Invalid configuration: You must provide a basePath in the configuration object');
    }
    if ( !config.rendering || !config.rendering.templateFolders ) {
      throw new Error('Invalid configuration: You must provide a valid config.rendering object');
    }

    // Resolve the paths to the templates and output folder
    config.rendering.templateFolders = _.map(config.rendering.templateFolders, function(templateFolder) {
      return path.resolve(config.basePath, templateFolder);
    });

    // Add the template finder to the dependency injector
    injectables.value('templateFinder', templateFinderFactory(config));

    // Lets use {$ $} for nunjucks interpolation rather than {{ }}, which conflicts with AngularJS
    env = new nunjucks.Environment(new nunjucks.FileSystemLoader(config.rendering.templateFolders, true),
      { tags: { variableStart: '{$', variableEnd: '$}' } }
    );


    // Configure nunjucks with the custom filters
    _.forEach(config.rendering.filters, function(filter) {
      env.addFilter(filter.name, filter.process);
    });


    // Configure nunjucks with the custom tags
    _.forEach(config.rendering.tags, function(tag) {
      env.addExtension(tag.tags[0], tag);
    });

    // Extract any extra helper functions/data from the config
    helpers = _.defaults({}, config.rendering.helpers);
  },
  /**
   * Render the set of documents to the output folder and extra data, using the templates found in the given folder
   * @param  {object} doc          The document to render
   * @returns {promise}            A promise to each of the output paths, resolved when all the docs have
   *                               been rendered and output
   */
  process: function render(docs, extraData, config, templateFinder) {
    _.forEach(docs, function(doc) {
      log.debug('Rendering doc', doc.id, doc.name);
      var data, res, err;
      try {
        data = _.defaults({}, { doc: doc, docs: docs }, extraData, helpers);
        var templateFile = templateFinder(data.doc);
        doc.renderedContent = env.render(templateFile, data);
      } catch(ex) {
        console.log(_.omit(doc, ['content', 'moduleDoc', 'components', 'serviceDoc', 'providerDoc']));
        throw new Error('Failed to render doc "' + doc.id + '" from file "' + doc.file + '" line ' + doc.startingLine + '\n Error Message follows:\n' + ex.stack);
      }
    });

  }
};