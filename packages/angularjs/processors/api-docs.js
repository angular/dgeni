var _ = require('lodash');

var handlers;

module.exports = {
  name: 'api-docs',
  description: 'Compute the various fields for docs in the API area',
  init: function(config, injectables) {
    handlers = config.get('processing.propertyHandlers');
    injectables.value('moduleMap', {});
  },
  process: function(docs, partialNames, moduleMap) {

    var mergeableTypes = {
      method: 'methods',
      property: 'properties',
      event: 'events'
    };

    _.forEach(docs, function(doc) {
      if ( doc.area === 'api' ) {

        var docTypeHandlers = handlers[doc.docType] || handlers['_'];

        _.forEach(docTypeHandlers, function(handler, property) {

          // If the handler is a string then it is actually a template
          if ( _.isString(handler) ) {
            var template = handler;
            handler = function(doc) {
              return _.template(template, doc);
            };
          }
          // If the handler is not a function then it is simply initializing a value
          else if ( !_.isFunction() ) {
            var value = handler;
            handler = function(doc) {
              return value;
            };
          }

          doc[property] = doc[property] || handler(doc);
        });

        if ( doc.docType === 'module' ) {

          // This doc is a module so do some extra work on it
          modules[doc.name] = doc;
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
      }

    });


    // Merge the memberof docs into their parent doc
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



    // Attach each doc to its module
    _.forEach(docs, function(doc) {
      if ( doc.docType !== 'module' && doc.module ) {
        var module = modules[doc.module];
        if ( module ) {
          module.components.push(doc);
        }
        doc.moduleDoc = module;
      }
    });

  }
};