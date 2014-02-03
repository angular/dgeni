var _ = require('lodash');

module.exports = {
  name: 'module',
  description: 'Compute module related properties',
  runAfter: ['id'],
  init: function(config, injectables) {
    injectables.value('modules', {});
  },
  process: function(docs, modules) {

    // Find each module doc, add it to the list of modules
    _.forEach(docs, function(doc) {
      if ( doc.docType === 'module' ) {
        
        // Add to the modules lookup map for later
        modules[doc.id] = doc;

        // Initialize the list of components
        doc.components = {};

        // Compute the package name and file name for the module
        var match = /^ng(.*)/.exec(doc.name);
        if ( match ) {
          var packageName = match[1].toLowerCase();
          if ( packageName ) { packageName = '-' + packageName; }
          doc.packageName = 'angular' + packageName;
          doc.packageFile = doc.packageName + '.js';
        }
      }
    });

    // Attach each doc to its module
    _.forEach(docs, function(doc) {
      if ( doc.module && doc.docType !== 'module') {
        var module = modules['module:' + doc.module];
        if ( module ) {
          var componentGroup = module.components[doc.docType] || [];
          componentGroup.push(doc);
          module.components[doc.docType] = componentGroup;
        }
        doc.moduleDoc = module;
      }
    });

    // Sort the components by id
    _.forEach(modules, function(module) {
      module.components = _(module.components)
        .map(function(pages, docType) {
          return {
            type: docType,
            pages: _.sortBy(pages, 'id')
          };
        })
        .sortBy('type')
        .value();
    });
  }
};
