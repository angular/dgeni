function gitTagFromFullVersion(version) {
  var match = version.match(/-(\w{7})/);

  if (match) {
    // git sha
    return match[1];
  }

  // git tag
  return 'v' + version;
}


module.exports = function(owner, repo, version) {
  return {
    owner: owner,
    repo: repo,
    version: version,
    tag: gitTagFromFullVersion(version)
  };
};