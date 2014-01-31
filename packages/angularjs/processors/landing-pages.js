var _ = require('lodash');
var path = require('canonical-path');
var partialFolder;

module.exports = {
  name: 'landing-pages',
  description: 'Ensure that there is a page generated for all landing folders of each of the docs',
  runAfter: ['module'],
  init: function(config) {
    partialFolder = (config && config.rendering && config.rendering.partialFolder) || 'partials';
  },
  after: function(docs) {
    var paths = _.indexBy(docs, 'path');
    var landingPages = {};

    _.forEach(docs, function(doc) {
      var landingPath = path.dirname(doc.path);

      if (landingPath === '.' || paths[landingPath] ) { return; }

      var landingPage = landingPages[landingPath];
      if (!landingPage) {
        // We haven't seen this landing page before so let's create it
        landingPages[landingPath] = landingPage = {
          id: landingPath,
          docType: 'landingPage',
          groupType: doc.docType,
          moduleDoc: doc.moduleDoc,
          module: doc.module,
          path: landingPath,
          outputPath: partialFolder + '/' + landingPath + '.html',
          area: doc.area,
          pages: []
        };
        // // Add this page to the module doc
        // var module = doc.moduleDoc;
        // if ( module ) {
        //   module.landingPages = module.landingPages || [];
        //   module.landingPages.push(landingPage);
        // } else {
        //   console.log('no module', doc.id);
        // }
      }

      // Add the current doc to the landingPage
      landingPage.pages.push(doc);
    });

    return docs.concat(_.values(landingPages));
  }
};