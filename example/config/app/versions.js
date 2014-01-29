angular.module('versions', [])

.controller('DocsVersionsCtrl', ['$scope', '$rootScope', '$window', 'NG_VERSIONS', 'NG_VERSION', function($scope, $rootScope, $window, NG_VERSIONS, NG_VERSION) {
  $scope.docs_versions = NG_VERSIONS;
  $scope.docs_version  = NG_VERSIONS[0];

  $scope.jumpToDocsVersion = function(version) {
    var currentPagePath = '';

    // preserve URL path when switching between doc versions
    if (angular.isObject($rootScope.currentPage) && $rootScope.currentPage.section && $rootScope.currentPage.id) {
      currentPagePath = '/' + $rootScope.currentPage.section + '/' + $rootScope.currentPage.id;
    }

    $window.location = version.url + currentPagePath;
  };
}]);