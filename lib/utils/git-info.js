var shell = require('shelljs');
var _ = require('lodash');

// Matches versions from 1.0 onwards - groups:
// 1: Major Version, 2: Minor Version Number
// 3: Patch Version , 4: Release Candidate (optional)
// 5: Snapshot Identifier (optional)
var VERSION_REGEX = /([1-9]\d*)\.(\d+)\.(\d+)(?:-?rc\.?(\d+)|-(snapshot))?/;

// Match the parts of the git repository - groups:
// 1: owner, 2: repo
var GITURL_REGEX = /^https:\/\/github.com\/([^\/]+)\/(.+).git$/;

// Pad out a number with zeros at the front to make it `digits` characters long
function pad(num, digits) {
  var zeros = Array(digits+1).join('0');
  return (zeros+num).slice(-digits);
}

function padVersion(version) {
  // We pad out the version numbers with 0s so they sort nicely
  // - Non-Release Candidates get 9999 for their release candidate section to make them appear earlier
  // - Snapshots get 9 added to the front to move them to the top of the list
  var maxLength = 4;
  var padded = (version.snapshot ? '9' : '0') +
                        pad(version.major, maxLength) +
                        pad(version.minor, maxLength) +
                        pad(version.dot, maxLength) +
                        pad(version.rc || 9999, maxLength);
  return padded;
}

// Calculate the snapshot number for this build
function getSnapshotSuffix() {
  var jenkinsBuild = process.env.BUILD_NUMBER || 'local';
  var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).output.replace('\n', '');
  return 'build.'+jenkinsBuild+'+sha.'+hash;
}


function getVersion(tag) {
  var match = VERSION_REGEX.exec(tag);
  if ( match ) {
    var version = {
      tag: tag,
      major: match[1],
      minor: match[2],
      dot: match[3],
      rc: match[4],
      snapshot: !!match[5] && getSnapshotSuffix()
    };

    if(version.snapshot) {
      version.full = version.major + '.' + version.minor + '.x (edge)';
    } else {
      version.full = version.major + '.' + version.minor + '.' + version.dot +
                    (version.rc ? '-rc.' + version.rc : '');
    }

    // Stable versions have an even minor version and are not a release candidate
    version.isStable = !(version.minor%2 || version.rc);

    // Versions before 1.0.2 had a different docs folder name
    version.docsUrl = 'http://code.angularjs.org/' + version.full + '/docs';
    if ( version.major < 1 || (version.major === 1 && version.minor === 0 && version.dot < 2 ) ) {
      version.docsUrl += '-' + version.full;
    }

    return version;
  }
}

function getCurrentVersion(package) {
  return _.merge(getVersion(package.version), {
    isMaster: true,
    docsUrl: 'http://docs.angularjs.org',
    cdnVersion: package.cdnVersion,
    codename: package.codename,
    tag: package.cdnVersion
  });
}

function getGitInfo(url) {
  var match = GITURL_REGEX.exec(url);
  var git = {
    owner: match[1],
    repo: match[2]
  };
  return git;
}

function getVersions() {
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

  return _(versions)
    .map(getVersion)
    .filter()  // getVersion can map to undefined - this clears those out
    .sortBy(padVersion)
    .value();
}

module.exports = {
  getGitInfo: getGitInfo,
  getVersion: getVersion,
  getVersions: getVersions,
  getCurrentVersion: getCurrentVersion
};
