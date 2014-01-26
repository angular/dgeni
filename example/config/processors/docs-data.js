var _ = require('lodash');
var shell = require('shelljs');
var fs = require('fs');

function sortVersionsNaturally(versions) {
  var versionMap = {},
      NON_RC_RELEASE_NUMBER = 999;
  for(var i = versions.length - 1; i >= 0; i--) {
    var version = versions[i];
    var split = version.split(/\.|rc/);
     var baseVersion = split[0] + '.' + split[1] + '.' + split[2];

    //create a map of RC versions for each version
    //this way each RC version can be sorted in "natural" order
    versionMap[baseVersion] = versionMap[baseVersion] || [];

    //NON_RC_RELEASE_NUMBER is used to signal the non-RC version for the release and
    //it will always appear at the top of the list since the number is so high!
    versionMap[baseVersion].push(
      version == baseVersion ? NON_RC_RELEASE_NUMBER : parseInt(version.match(/rc\.?(\d+)/)[1], 10));
  }

  //flatten the map so that the RC versions occur in a natural sorted order
  //and the official non-RC version shows up at the top of the list of sorted
  //RC versions!
  var angularVersions = [];
  sortedKeys(versionMap).forEach(function(key) {
    var versions = versionMap[key];

    //basic numerical sort
    versions.sort(function(a,b) {
      return a - b;
    });

    versions.forEach(function(v) {
      angularVersions.push(v == NON_RC_RELEASE_NUMBER ? key : key + 'rc' + v);
    });
  });

  return angularVersions;
}

function sortedKeys(obj) {
  var keys = [];
  for(var key in obj) {
    keys.push(key);
  }
  keys.sort(true);
  return keys;
}

function expandVersions(versions, latestVersion) {
  var RC_VERSION = /rc\d/;
  //copy the array to avoid changing the versions param data
  //the latest version is not on the git tags list, but
  //docs.angularjs.org will always point to master as of 1.2
  versions = versions.concat([latestVersion]);

  var firstUnstable, expanded = [];
  for(var i=versions.length-1;i>=0;i--) {
    var version = versions[i],
        split = version.split('.'),
        isMaster = version == latestVersion,
        isStable = split[1] % 2 === 0 && !RC_VERSION.test(version);

    var title = 'AngularJS - v' + version;

    var docsPath = version < '1.0.2' ?  'docs-' + version : 'docs';

    var url = isMaster ?
      'http://docs.angularjs.org' :
      'http://code.angularjs.org/' + version + '/' + docsPath;

    expanded.push({
      version : version,
      stable : isStable,
      title : title,
      group : (isStable ? 'Stable' : 'Unstable'),
      url : url
    });
  }

  return expanded;
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
  var versions = [], regex = /^v([1-9]\d*(?:\.\d+\S+)+)$/; //only fetch >= 1.0.0 versions
  shell.exec('git tag', {silent: true}).output.split(/\s*\n\s*/)
    .forEach(function(line) {
      var matches = regex.exec(line);
      if(matches && matches.length > 0) {
        versions.push(matches[1]);
      }
    });

  //match the future version of AngularJS that is set in the package.json file
  return expandVersions(sortVersionsNaturally(versions), ngCurrentVersion().full);

}

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
      versions: ngVersions(),
      currentVersion: ngCurrentVersion(),
      pages: _.map(
        _.filter(docs, function(doc) { return doc.section; }),
        function(doc) {
          return {
            id: doc.id,
            name: doc.name,
            description: doc.description,
            section: doc.section,
            module: doc.module,
            keywords: doc.keywords
          };
        }
      )
    };
    docs.push(docData);
  }
};