var _ = require('lodash');

module.exports = {
  name: 'component-groups',
  description: 'Ensure that there is a page generated for all groups of components',
  runAfter: ['adding-extra-docs'],
  process: function(docs, moduleMap) {
    var componentGroupDocs = [];

    _.forEach(moduleMap, function(module) {

      module.componentGroups = _(module.components)
        .groupBy('docType')
        .map(function(docs, docType) {
          return {
            id: module.id + '.' + docType,
            parent: module.id,
            docType: 'componentGroup',
            groupType: docType,
            moduleDoc: module,
            pathSegment: docType,
            area: module.area,
            components: docs
          };
        }).value();

      // Add this module's collection of componentGroup docs to the overall list
      componentGroupDocs = componentGroupDocs.concat(module.componentGroups);
    });

    // Add the newly generated docs to the list of docs to render
    return docs.concat(componentGroupDocs);
  }
};