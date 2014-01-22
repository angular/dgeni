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
    _.forEach(deployment.environments, function(environment) {

      var indexDoc = _.defaults({
        docType: 'index',
      }, environment);

      indexDoc.id = 'index' + (environment.name === 'default' ? '' : '-' + environment.name);
      indexDoc.outputPath = indexDoc.id + '.html';

      docs.push(indexDoc);
    });
  }
};