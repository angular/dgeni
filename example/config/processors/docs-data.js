var _ = require('lodash');
var shell = require('shelljs');
var fs = require('fs');

function sortVersionsNaturally(versions) {
  var pad = function(num) { return ('0000'+num).slice(-4); };
  var VERSION_REGEX = /(\d+)\.(\d+)\.(\d+)(?:-?rc\.?(\d+))?/;

  return _.sortBy(versions, function(version) {
    var matches = VERSION_REGEX.exec(version);
    // We pad out the version numbers with 0s so they sort nicely
    // Non-Release Candidates get 0999 for the last section to make them appear
    // earlier than release candidates
    var versionPadded = pad(matches[1]) + pad(matches[2]) + pad(matches[3]) + pad(matches[4] || 999);
    return versionPadded;
  });
}


function expandVersions(versions, latestVersion) {
  // The version is stable if its 2nd number is even and doesn't contain "rc"
  var UNSTABLE_REGEX = /\d+\.\d*[13579]\.\d+|rc/;

  //copy the array to avoid changing the versions param data the latest version is not on the
  //git tags list, but docs.angularjs.org will always point to master as of 1.2
  versions = versions.concat([latestVersion]);

  return _.map(versions, function(version) {
    var isMaster = version === latestVersion;
    var isStable = !UNSTABLE_REGEX.test(version);
    var title = 'AngularJS - v' + version;
    var docsPath = version < 'v1.0.2' ? 'docs-' + version : 'docs';
    var url = isMaster ?
      'http://docs.angularjs.org' :
      'http://code.angularjs.org/' + version + '/' + docsPath;
    return {
      version: version,
      stable: isStable,
      group: isStable ? 'Stable' : 'Unstable',
      title: title,
      url: url
    };
  }).reverse();
}

var version;
function ngCurrentVersion() {
  if (version) return version;

  var package = JSON.parse(fs.readFileSync('package.json', 'UTF-8'));
  var match = package.version.match(/^([^\-]*)(?:\-(.+))?$/);
  var semver = match[1].split('.');

  var fullVersion = match[1];

  if (match[2]) {
    fullVersion += '-';
    fullVersion += (match[2] == 'snapshot') ? getSnapshotSuffix() : match[2];
  }

  version = {
    full: fullVersion,
    major: semver[0],
    minor: semver[1],
    dot: semver[2].replace(/rc\d+/, ''),
    codename: package.codename,
    cdn: package.cdnVersion
  };

  return version;

  function getSnapshotSuffix() {
    var jenkinsBuild = process.env.BUILD_NUMBER || 'local';
    var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).output.replace('\n', '');
    return 'build.'+jenkinsBuild+'+sha.'+hash;
  }
}

function ngVersions() {
  var regex = /^v([1-9]\d*(?:\.\d+\S+)+)$/; //only fetch >= 1.0.0 versions
  var versions = shell.exec('git tag', {silent: true}).output.split(/\s*\n\s*/);

  versions = [
    'g3-v1.0.0-rc2', 'g3-v1.0.0rc1', 'v0.10.0', 'v0.10.1', 'v0.10.2', 'v0.10.3', 'v0.10.4', 'v0.10.5', 'v0.10.6', 'v0.9.0', 'v0.9.1', 'v0.9.10',
    'v0.9.11', 'v0.9.12', 'v0.9.13', 'v0.9.14', 'v0.9.15', 'v0.9.16', 'v0.9.17', 'v0.9.18', 'v0.9.19', 'v0.9.2', 'v0.9.3',
    'v0.9.4', 'v0.9.5', 'v0.9.6', 'v0.9.7', 'v0.9.9', 'v1.0.0', 'v1.0.0rc1', 'v1.0.0rc10', 'v1.0.0rc11', 'v1.0.0rc12', 'v1.0.0rc2', 'v1.0.0rc3', 'v1.0.0rc4', 'v1.0.0rc5',
    'v1.0.0rc6', 'v1.0.0rc7', 'v1.0.0rc8', 'v1.0.0rc9', 'v1.0.1', 'v1.0.2', 'v1.0.3', 'v1.0.4', 'v1.0.5', 'v1.0.6', 'v1.0.7', 'v1.0.8',
    'v1.1.0', 'v1.1.1', 'v1.1.2', 'v1.1.3', 'v1.1.4', 'v1.1.5', 'v1.2.0', 'v1.2.0-rc.2', 'v1.2.0-rc.3', 'v1.2.0rc1', 'v1.2.1', 'v1.2.10',
    'v1.2.2', 'v1.2.3', 'v1.2.4', 'v1.2.5', 'v1.2.6', 'v1.2.7', 'v1.2.8', 'v1.2.9'
  ];

  versions = _.filter(_.map(versions, function(version) {
    var matches = regex.exec(version);
    if(matches && matches.length > 0) {
      return matches[1];
    }
  }));

  //match the future version of AngularJS that is set in the package.json file
  return expandVersions(sortVersionsNaturally(versions), ngCurrentVersion().full);

}

module.exports = {
  name: 'docs-data',
  description: 'This plugin will create a new doc that will be rendered as an angularjs module ' +
               'which will contain meta information about the paths and versions of angular',
  requires: ['paths'],
  after: function(docs) {

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


    // We are only interested in docs that are in a section
    var pages = _(docs)
      .filter('section')
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
      .value();

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

    var docData = {
      docType: 'docs-data',
      id: 'docs-data',
      template: 'docs-data.template.js',
      outputPath: 'js/docs-data.js',
      versions: ngVersions(),
      currentVersion: ngCurrentVersion(),
      sections: sections,
      pages: _.indexBy(pages, 'id')
    };
    docs.push(docData);
  }
};