var _ = require('lodash');
var log = require('winston');

var handlers;

module.exports = {
  name: 'api-docs',
  description: 'Compute the various fields for docs in the API area',
  runAfter: ['tags-extracted'],
  init: function(config, injectables) {
    handlers = config.get('processing.propertyHandlers');
    injectables.value('moduleMap', {});
  },
  process: function(docs, partialNames, moduleMap) {

    // Identify the modules and add some meta data to each
    _.forEach(docs, function(doc) {
      if ( doc.docType === 'module' ) {

        moduleMap[doc.name] = doc;
        doc.components = [];

        // Compute the package name and filename for the module
        var match = /^ng(.*)/.exec(doc.name);
        if ( match ) {
          var packageName = match[1].toLowerCase();
          if ( packageName ) { packageName = '-' + packageName; }
          doc.packageName = 'angular' + packageName;
          doc.packageFile = doc.packageName + '.js';
        }
      }
    });


    // Merge the memberof docs into their parent doc
    var mergeableTypes = {
      method: 'methods',
      property: 'properties',
      event: 'events'
    };
    docs = _.where(docs, function(doc) {

      var isChild = false;

      _.forEach(mergeableTypes, function(containerProperty, memberDocType) {
        var containerDoc;

        if ( doc.docType === memberDocType ) {

          log.debug('child doc found', doc.id);
          isChild = true;

          // Convert a name that contains a hash into memberof and id
          doc.id.replace(/^([^#]+)(?:#([^#]+))?$/, function(match, memberof, id) {
            doc.memberof = memberof;
            doc.id = id;
          });

          containerDoc = partialNames.getDoc(doc.memberof);

          if ( !containerDoc ) {
            log.warn('Missing container document "'+ doc.memberof + '" referenced by "'+ doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine);
            return;
          }
          if ( _.isArray(containerDoc) ) {
            log.warn('Ambiguous container document reference "'+ doc.memberof + '" referenced by "'+ doc.id + '" in file "' + doc.file + '" at line ' + doc.startingLine);
            return;
          }

          var container = containerDoc[containerProperty] = containerDoc[containerProperty] || [];
          container.push(doc);
        }
      });

      return !isChild;
    });

    // Map services to their providers
    _.forEach(docs, function(doc) {
      if ( doc.docType === 'provider' ) {
        var serviceId = doc.id.replace(/provider:/, 'service:').replace(/Provider$/, '');
        var serviceDoc = partialNames.getDoc(serviceId);

        if ( serviceDoc ) {
          doc.serviceDoc = serviceDoc;
          serviceDoc.providerDoc = doc;
        } else {
          log.warn('Missing service "' + serviceId + '" for provider "' + doc.id + '"');
        }
      }
    });

    // Attach each doc to its module
    _.forEach(docs, function(doc) {
      if ( doc.docType !== 'module' && doc.module ) {
        var module = moduleMap[doc.module];
        if ( module ) {
          module.components.push(doc);
        }
        doc.moduleDoc = module;
      }
    });

  }
};