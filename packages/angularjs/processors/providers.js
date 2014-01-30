var _ = require('lodash');
var log = require('winston');

module.exports = {
  name: 'providers',
  runAfter: ['doctrine-tag-extractor'],

  description: 'Relate service and their providers',

  after: function relateServicesToProviders(docs) {
    var docMap = _.indexBy(docs, 'id');

    _.forEach(docs, function(doc) {
      if ( doc.docType === 'provider' ) {
        var serviceId = doc.id.replace(/Provider$/, '');
        var serviceDoc = docMap[serviceId];

        if ( serviceDoc ) {
          doc.serviceDoc = serviceDoc;
          serviceDoc.providerDoc = doc;
        } else {
          log.warn('Missing service "' + serviceId + '" for provider "' + doc.id + '"');
        }
      }
    });
  }
};