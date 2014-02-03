'use strict';

/**
 * @ngdoc service
 * @name  $document
 * @requires $window
 *
 * @description
 * A {@link function:angular.element jQuery (lite)}-wrapped reference to the browser's `window.document`
 * element.
 */
function $DocumentProvider(){
  this.$get = ['$window', function(window){
    return jqLite(window.document);
  }];
}
