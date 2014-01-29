var _ = require('lodash');
var shell = require('shelljs');
var fs = require('fs');

// Matches versions from 1.0 onwards
// Group 1: Major Version Number
// Group 2: Minor Version Number
// Group 3: Patch Version Number
// Group 4: Release Candidate Number (optional)
// Group 5: Snapshot Identifier
var VERSION_REGEX = /([1-9]\d*)\.(\d+)\.(\d+)(?:-?rc\.?(\d+)|-(snapshot))?/;

// The version is stable if its 2nd number is even and doesn't contain "rc"
var UNSTABLE_REGEX = /\d+\.\d*[13579]\.\d+|rc/;

// Versions before 1.0.2 had a different docs folder name
var OLDDOCSFOLDER_REGEX = /1.0.[01]([^\d]|$)/;

function pad(num) {
  return ('0000'+num).slice(-4);
}


function getSnapshotSuffix() {
  var jenkinsBuild = process.env.BUILD_NUMBER || 'local';
  var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).output.replace('\n', '');
  return 'build.'+jenkinsBuild+'+sha.'+hash;
}


function ngCurrentVersion() {
  var package = JSON.parse(fs.readFileSync('package.json', 'UTF-8'));
  var match = VERSION_REGEX.exec(package.version);
  var version = match[1] + '.' + match[2] + '.' + match[3] +
                  (match[4] ? '-rc.' + match[4] : '') +
                  (match[5] ? '-' + getSnapshotSuffix() : '');
  return version;
}

function ngVersions() {
  var latestVersion = ngCurrentVersion();
  var versions = shell.exec('git tag', {silent: true}).output.split(/\s*\n\s*/);

  //// TODO - remove this mock list of versions
  versions = [
    'g3-v1.0.0-rc2', 'g3-v1.0.0rc1', 'v0.10.0', 'v0.10.1', 'v0.10.2', 'v0.10.3', 'v0.10.4', 'v0.10.5', 'v0.10.6', 'v0.9.0', 'v0.9.1', 'v0.9.10',
    'v0.9.11', 'v0.9.12', 'v0.9.13', 'v0.9.14', 'v0.9.15', 'v0.9.16', 'v0.9.17', 'v0.9.18', 'v0.9.19', 'v0.9.2', 'v0.9.3',
    'v0.9.4', 'v0.9.5', 'v0.9.6', 'v0.9.7', 'v0.9.9', 'v1.0.0', 'v1.0.0rc1', 'v1.0.0rc10', 'v1.0.0rc11', 'v1.0.0rc12', 'v1.0.0rc2', 'v1.0.0rc3', 'v1.0.0rc4', 'v1.0.0rc5',
    'v1.0.0rc6', 'v1.0.0rc7', 'v1.0.0rc8', 'v1.0.0rc9', 'v1.0.1', 'v1.0.2', 'v1.0.3', 'v1.0.4', 'v1.0.5', 'v1.0.6', 'v1.0.7', 'v1.0.8',
    'v1.1.0', 'v1.1.1', 'v1.1.2', 'v1.1.3', 'v1.1.4', 'v1.1.5', 'v1.2.0', 'v1.2.0-rc.2', 'v1.2.0-rc.3', 'v1.2.0rc1', 'v1.2.1',
    'v1.2.2', 'v1.2.3', 'v1.2.4', 'v1.2.5', 'v1.2.6', 'v1.2.7', 'v1.2.8', 'v1.2.9'
  ];
  //// ODOT

  versions = _(versions)
    .filter(function(version) { return version.indexOf('v1') === 0; })

    .map(function(version) {
      return version.substr(1);
    })

    .sortBy(function(version) {
      var matches = VERSION_REGEX.exec(version);
      // We pad out the version numbers with 0s so they sort nicely
      // - Non-Release Candidates get 0999 for their release candidate section to make them appear earlier
      // - Snapshots get 9 added to the front to move them to the top of the list
      var versionPadded = (matches[5] ? '9' : '0') + pad(matches[1]) + pad(matches[2]) + pad(matches[3]) + pad(matches[4] || 999);
      return versionPadded;
    })

    .tap(function(versions) {
      versions.push(latestVersion);
    })

    .map(function(version) {
      var isMaster = version === latestVersion;
      var isStable = !UNSTABLE_REGEX.test(version);
      var title = 'AngularJS - v' + version;
      var docsFolder = 'docs';
      var docsUrl = 'http://docs.angularjs.org';
      
      if ( OLDDOCSFOLDER_REGEX.exec(version) ) {
        docsFolder += '-' + version;
      }

      if (!isMaster) {
        docsUrl = 'http://code.angularjs.org/' + version + '/' + docsFolder;
      }

      return {
        version: version,
        stable: isStable,
        master: isMaster,
        group: isStable ? 'Stable' : 'Unstable',
        title: title,
        url: docsUrl
      };
    })
    .value()
    .reverse();

    return versions;

}

module.exports = {
  name: 'versions-data',
  description: 'This plugin will create a new doc that will be rendered as an angularjs module ' +
               'which will contain meta information about the versions of angular',
  after: function(docs) {

    docs.push({
      docType: 'versions-data',
      id: 'versions-data',
      template: 'versions-data.template.js',
      outputPath: 'js/versions-data.js',
      versions: ngVersions(),
      currentVersion: ngCurrentVersion()
    });
  }
};