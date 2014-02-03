var _ = require('lodash');
var log = require('winston');

module.exports = {
  name: 'service-provider-mapping',
  runAfter: ['docs-processed'],
  runBefore: ['rendering-docs'],
  description: 'Relate services to their providers',

  process: function relateServicesToProviders(docs) {
    var docMap = _.indexBy(docs, 'id');

    _.forEach(docs, function(doc) {
      if ( doc.docType === 'provider' ) {
        var serviceId = doc.id.replace(/provider:/, 'service:').replace(/Provider$/, '');
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