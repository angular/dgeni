var _ = require('lodash');

var SECTION_NAMES = {
  api: 'API Reference',
  guide: 'Developer Guide',
  misc: 'Miscellaneous',
  tutorial: 'Tutorial',
  error: 'Error Reference'
};


var sectionNavigationMapping = {
  api: function(pages, sectionName) {
    var navGroups = _(pages)
      .groupBy('module')
      .map(function(pages, moduleName) {
        
        var navItems = [];
        var modulePage;

        _(pages)

          .groupBy('docType')

          .tap(function(docTypes) {
            // Extract the module page from the collection
            modulePage = docTypes.module[0];
            delete docTypes.module;
          })

          .forEach(function(pages, typeName) {

            // Push a navItem for this section
            navItems.push({
              name: typeName,
              type: 'section',
              href: modulePage.path + "#" + typeName
            });
            
            // Push the rest of the pages for this section
            _.forEach(pages, function(page) {

              navItems.push({
                name: page.name,
                href: page.path,
                type: page.docType
              });

            });
          });
        return {
          name: moduleName,
          href: modulePage.path,
          type: 'group',
          navItems: navItems
        };
      })
      .value();
    return navGroups;
  },
  tutorial: function(pages, sectionName) {
    var navItems = _.sortBy(_.map(pages, function(page) {
      // Get the tutorial step number from the name
      var match = /^\s*(\d+)/.exec(page.name);
      return {
        name: page.name,
        step: page.step,
        href: page.path,
        type: 'tutorial'
      };
    }), 'step');

    return [{
      name: sectionName,
      navItems: navItems
    }];
  },
  error: function(pages, sectionName) {
    var items;


    return items;
  },
  pages: function(pages, sectionName) {
    var navItems = _.sortBy(_.map(pages, function(page) {
      return {
        name: page.name,
        href: page.path,
        type: 'page'
      };
    }), 'name');

    return [{
      name: sectionName,
      navItems: navItems
    }];
  }
};

module.exports = {
  name: 'pages-data',
  description: 'This plugin will create a new doc that will be rendered as an angularjs module ' +
               'which will contain meta information about the pages and navigation',
  runAfter: ['paths'],
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
          navGroups: mapper(pages, sectionName)
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