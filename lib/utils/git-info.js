var shell = require('shelljs');
var semver = require('semver');
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
  var jenkinsBuild = process.env.TRAVIS_BUILD_NUMBER || process.env.BUILD_NUMBER || 'local';
  var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).output.replace('\n', '');
  return 'build.'+jenkinsBuild+'+sha.'+hash;
}

  var version;
  function getVersion(package){
    if (version) return version;

    var gitTag = getTagOfCurrentCommit();
    var semVerVersion, codeName, fullVersion;

    if (gitTag) {
      // tagged release
      fullVersion = semVerVersion = semver.valid(gitTag);
      codeName = getTaggedReleaseCodeName(gitTag);
    } else {
      // snapshot release
      semVerVersion = getSnapshotVersion();
      fullVersion = semVerVersion + '-' + getSnapshotSuffix();
      codeName = 'snapshot';
    }

    var versionParts = semVerVersion.match(/(\d+)\.(\d+)\.(\d+)/);

    version = {
      full: fullVersion,
      major: versionParts[1],
      minor: versionParts[2],
      dot: versionParts[3],
      codename: codeName,
      cdn: package.cdnVersion
    };

    return version;


    function getTagOfCurrentCommit() {
      var gitTagResult = shell.exec('git describe --exact-match', {silent:true});
      var gitTagOutput = gitTagResult.output.trim();
      var branchVersionPattern = new RegExp(package.branchVersion.replace('.', '\\.').replace('*', '\\d+'));
      if (gitTagResult.code === 0 && gitTagOutput.match(branchVersionPattern)) {
        return gitTagOutput;
      } else {
        return null;
      }
    }

    function getTaggedReleaseCodeName(tagName) {
      var tagMessage = shell.exec('git cat-file -p '+ tagName +' | grep "codename"', {silent:true}).output;
      var codeName = tagMessage && tagMessage.match(/codename\((.*)\)/)[1];
      if (!codeName) {
        throw new Error("Could not extract release code name. The message of tag "+tagName+
          " must match '*codename(some release name)*'");
      }
      return codeName;
    }

    function getSnapshotVersion() {
      var oldTags = shell.exec('git tag -l v'+package.branchVersion, {silent:true}).output.trim().split('\n');
      // ignore non semver versions.
      oldTags = oldTags.filter(function(version) {
        return version && semver.valid(version);
      });
      if (oldTags.length) {
        oldTags.sort(semver.compare);
        semVerVersion = oldTags[oldTags.length-1];
        if (semVerVersion.indexOf('-') !== -1) {
          semVerVersion = semver.inc(semVerVersion, 'prerelease');
        } else {
          semVerVersion = semver.inc(semVerVersion, 'patch');
        }
      } else {
        semVerVersion = semver.valid(package.branchVersion.replace(/\*/g, '0'));
      }
      return semVerVersion;
    }
  }

function getVersionFromTag(tag) {
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

function getGitRepoInfo(url) {
  var match = GITURL_REGEX.exec(url);
  var git = {
    owner: match[1],
    repo: match[2]
  };
  return git;
}

function getPreviousVersions() {
  var versions = shell.exec('git tag', {silent: true}).output.split(/\s*\n\s*/);

  return _(versions)
    .map(getVersion)
    .filter()  // getVersion can map to undefined - this clears those out
    .sortBy(padVersion)
    .value();
}

module.exports = {
  getGitRepoInfo: getGitRepoInfo,
  getVersionFromTag: getVersionFromTag,
  getPreviousVersions: getPreviousVersions,
  getCurrentVersion: getCurrentVersion
};


