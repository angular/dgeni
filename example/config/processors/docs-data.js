var _ = require('lodash');

module.exports = {
  name: 'docs-data',
  description: 'This plugin will create a new doc that will be rendered as an angularjs module ' +
               'which will contain meta information about the paths and versions of angular',
  requires: ['paths'],
  after: function(docs) {
    var docData = {
      docType: 'docs-data',
      id: 'docs-data',
      template: 'docs-data.template.js',
      outputPath: 'js/docs-data.js',
      versions: [],
      currentVersion: '',
      pages: _.filter(docs, function(doc) { return doc.section; })
    };
    docs.push(docData);
  }
};