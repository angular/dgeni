var _ = require('lodash');
var gitInfo = require('../../../lib/utils/git-info');

var package;

module.exports = {
  name: 'versions-data',
  description: 'This plugin will create a new doc that will be rendered as an angularjs module ' +
               'which will contain meta information about the versions of angular',
  runAfter: ['adding-extra-docs', 'pages-data'],
  runBefore: ['extra-docs-added'],
  init: function(config) {
    package = config.source.nodePackage;
  },
  process: function(docs) {

    var versionDoc = {
      docType: 'versions-data',
      id: 'versions-data',
      template: 'versions-data.template.js',
      outputPath: 'js/versions-data.js',
    };

    versionDoc.currentVersion = gitInfo.getCurrentVersion(package);

    versionDoc.versions = _(gitInfo.getVersions())
      .filter(function(version) { return version.major > 0; })
      .push(versionDoc.currentVersion)
      .reverse()
      .value();

    docs.push(versionDoc);
  }
};