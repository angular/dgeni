angular.module('directives', [])

.directive('code', function() {
  return { restrict:'E', terminal: true };
})

/**
 * backToTop Directive
 * @param  {Function} $anchorScroll
 *
 * @description Ensure that the browser scrolls when the anchor is clicked
 */
.directive('backToTop', ['$anchorScroll', function($anchorScroll) {
  return function link(scope, element) {
    element.on('click', function(event) {
      scope.$apply($anchorScroll);
    });
  };
}]);

