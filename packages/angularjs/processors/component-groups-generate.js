var _ = require('lodash');

module.exports = {
  name: 'component-groups-generate',
  description: 'Add new component-groups docs',
  runAfter: ['adding-extra-docs'],
  runBefore: ['extra-docs-added'],
  process: function(docs, moduleMap) {
    _.forEach(moduleMap, function(module) {

      _(module.components)
        .groupBy('docType')
        .tap(function(docTypes) {
          // We don't want the overview docType to be represented as a componentGroup
          delete docTypes.overview;
        })
        .map(function(docs, docType) {
          return {
            id: module.id + '.' + docType,
            docType: 'componentGroup',
            groupType: docType,
            module: module.name,
            moduleDoc: module,
            area: module.area,
            components: docs,
            outputPath: _.template('partials/${module.area}/${module.name}/${docType}/index.html', { module: module, docType: docType }),
            path: _.template('${module.area}/${module.name}/${docType}', { module: module, docType: docType })
          };
        })
        .tap(function(groups) {
          module.componentGroups = groups;
          _.forEach(groups, function(group) {
            docs.push(group);
          });
        });
    });
  }
};