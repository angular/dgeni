var _ = require('lodash');

var SECTION_NAMES = {
  api: 'API Reference',
  guide: 'Developer Guide',
  misc: 'Miscellaneous',
  tutorial: 'Tutorial',
  error: 'Error Reference'
};


// Group and sort the given pages by docType
function pagesByType(pages) {
  
  return _(pages)
    .groupBy('docType')
    .map(function(pages, typeName) {
      return {
        typeName: typeName,
        pages: _.sortBy(_.pluck(pages, 'path'))
      };
    })
    .sortBy('typeName')
    .value();
}

var sectionNavigationMapping = {
  api: function(pages, sectionName) {
    var items;

          // return {
          //   sectionName: sectionName,
          //   modules: _(pages)
          //     .groupBy('module')
          //     .map(function(pages, moduleName) {
          //       return {
          //         moduleName: moduleName,
          //         types: pagesByType(pages)
          //       };
          //     })
          //     .sortBy('moduleName')
          //     .value()
          // };

    return items;
  },
  tutorial: function(pages, sectionName) {
    var items = _.sortBy(_.map(pages, function(page) {
      // Get the tutorial step number from the name
      var match = /^\s*(\d+)/.exec(page.name);
      var step = match && match[1] && parseInt(match[1], 10);
      return {
        name: page.name,
        step: step,
        href: page.path,
        type: 'tutorial'
      };
    }), 'step');
    return items;
  },
  error: function(pages, sectionName) {
    var items;


    return items;
  },
  pages: function(pages, sectionName) {
    var items = _.sortBy(_.map(pages, function(page) {
      return {
        name: page.name,
        href: page.path,
        type: 'page'
      };
    }), 'name');

    return items;
  }
};

module.exports = {
  name: 'pages-data',
  description: 'This plugin will create a new doc that will be rendered as an angularjs module ' +
               'which will contain meta information about the pages and navigation',
  requires: ['paths'],
  after: function(docs) {

    // We are only interested in docs that are in a section
    var pages = _.filter(docs, 'section');

    // Generate an object collection of pages that is grouped by section
    var sections = {};
    _(pages)
      .groupBy('section')
      .forEach(function(pages, sectionName) {
        var mapper = sectionNavigationMapping[sectionName] || sectionNavigationMapping['pages'];
        sections[sectionName] = {
          id: sectionName,
          name: SECTION_NAMES[sectionName],
          pages: mapper(pages, sectionName)
        };
      });

    pages = _(pages)
      .map(function(doc) {
        return _.pick(doc, [
          'docType', 'id', 'name', 'section', 'outputPath', 'path', 'searchTerms'
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