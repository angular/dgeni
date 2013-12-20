var git = require('../../lib/utils/git');

describe("utils/git", function() {
  it("should return an object with git info", function() {
    expect(git('angular', 'angular.js', '1.2.5')).toEqual({
      owner: 'angular',
      repo: 'angular.js',
      version: '1.2.5',
      tag: 'v1.2.5'
    });
  });
});