var _ = require('lodash');
var modules = {};

module.exports = {
  name: 'module',
  description: 'Compute module related properties',
  requires: ['doctrine-tag-extractor'],
  each: function(doc) {
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
    }
  },
  after: function(docs) {
    // Attach each doc to its module
    _.forEach(docs, function(doc) {
      if ( doc.module && doc.docType !== 'module') {
        var module = modules['module:' + doc.module];
        if ( module ) {
          module.components.push(doc);
        }
      }
    });

    // Sort the components by name
    _.forEach(modules, function(module) {
      module.components = _.sortBy(module.components, 'name');
    });
  }
};
