var _ = require('lodash');
var log = require('winston');
var deployment;

module.exports = {
  name: 'index-page',
  requires: ['examples', 'links'],
  description: 'This processor creates docs that will be rendered as the index page for the app',
  init: function(config) {
    deployment = config.deployment;
    if ( !deployment || !deployment.environments ) {
      throw new Errro('No deployment environments found in the config.');
    }
  },
  after: function(docs) {

    // Collect up all the sections in the docs
    var sections = {};
    _.forEach(docs, function(doc) {
      if ( doc.section ) {
        sections[doc.section] = doc.section;
      }
    });
    sections = _.keys(sections);

    _.forEach(deployment.environments, function(environment) {

      var indexDoc = _.defaults({
        docType: 'index',
        sections: sections
      }, environment);

      indexDoc.id = 'index' + (environment.name === 'default' ? '' : '-' + environment.name);
      indexDoc.outputPath = indexDoc.id + '.html';

      docs.push(indexDoc);
    });
  }
};