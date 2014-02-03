var _ = require('lodash');

module.exports = {
  name: 'module',
  description: 'Compute module related properties',
  runAfter: ['links', 'keywords'],
  init: function(config, injectables) {
    injectables.value('modules', {});
  },
  process: function(docs, modules) {
    var otherDocs = [];
    // Find each module doc, add it to the list of modules
    _.forEach(docs, function(doc) {
      if ( doc.docType === 'module' ) {
        
        // Add to the modules lookup map for later
        modules[doc.id] = doc;

        // Initialize the list of components
        doc.components = [];

        // Compute the package name and file name for the module
        var match = /^ng(.*)/.exec(doc.name);
        if ( match ) {
          var packageName = match[1].toLowerCase();
          if ( packageName ) { packageName = '-' + packageName; }
          doc.packageName = 'angular' + packageName;
          doc.packageFile = doc.packageName + '.js';
        }
      } else {
        otherDocs.push(doc);
      }
    });

    // Attach each doc to its module
    _.forEach(otherDocs, function(doc) {
      if ( doc.module ) {
        var module = modules['module:' + doc.module];
        if ( module ) {
          module.components.push(doc);
        }
        doc.moduleDoc = module;
      }
    });
  }
};
