var _ = require('lodash');

// Group and sort the given pages by docType
function pagesByType(pages) {
  
  return _(pages)
    .groupBy('docType')
    .map(function(pages, typeName) {
      return {
        typeName: typeName,
        pages: _.sortBy(_.pluck(pages, 'id'))
      };
    })
    .sortBy('typeName')
    .value();
}

module.exports = {
  name: 'pages-data',
  description: 'This plugin will create a new doc that will be rendered as an angularjs module ' +
               'which will contain meta information about the pages and navigation',
  requires: ['paths'],
  after: function(docs) {

    // We are only interested in docs that are in a section
    var pages = _.filter(docs, 'section');

    // Generate an object collection of pages that is grouped by section
    var sections = _(pages)
      .groupBy('section')
      .map(function(pages, sectionName) {

        if ( sectionName === 'api' ) {
          // The section is api so we return a collection of pages grouped by module -> type
          return {
            sectionName: sectionName,
            modules: _(pages)
              .groupBy('module')
              .map(function(pages, moduleName) {
                return {
                  moduleName: moduleName,
                  types: pagesByType(pages)
                };
              })
              .sortBy('moduleName')
              .value()
          };
        } else {
          // The section is not api so we just return a colection of pages grouped by type
          return {
            sectionName: sectionName,
            pages: _.sortBy(_.pluck(pages, 'id'))
          };
        }
      })

      .sortBy('sectionName')
      .value();

    pages = _(pages)
      .map(function(doc) {
        return _.pick(doc, [
          'docType',
          'inputType',
          'id',
          'name',
          'section',
          'module',
          'outputPath',
          'path',
          'searchTerms'
        ]);
      })
      .indexBy('path')
      .value();


    var docData = {
      docType: 'pages-data',
      id: 'pages-data',
      template: 'pages-data.template.js',
      outputPath: 'js/pages-data.js',
      sections: sections,
      pages: pages
    };
    docs.push(docData);
  }
};