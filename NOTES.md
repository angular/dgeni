## Annotations
This could be done as an angular directive rather than the custom //!annotate solution

For example, in ngShow:

```
 * If you wish to change the hide behavior with ngShow/ngHide then this can be achieved by
 * restating the styles for the .ng-hide class in CSS:
 * <pre>
 * .ng-hide {
 *   <div annotation title="CSS Specificity" content="Not to worry, this will override the AngularJS default...">
 *   display:block!important;
 *   </div>
 *
 *   //this is just another form of hiding an element
 *   position:absolute;
 *   top:-9999px;
 *   left:-9999px;
 * }
 * </pre>
```

Or in ngAnimate

```
<pre class="prettyprint linenums">
var ngModule = angular.module(<div annotation title="Your AngularJS Module" content="Replace this or ngModule with the module that you used to define your application.">'YourApp'</div>, ['ngAnimate']);
ngModule.animation('.my-crazy-animation', function() {
  return {
    enter: function(element, done) {
      //run the animation here and call done when the animation is complete
      return function(cancelled) {
```


## @ngdoc tags
Currently they can be one of the following:

* `error` - only used for minerr documentation
* `function` - generally used for global functions but sometimes "misused" for a service or method
* `property` - generally used for properties on services but also used for `angular.version`
* `overview` - generally used for modules and ngdocs but also used for `ng.$rootElement` and `angular.mock` (should be objects?)
* `object` - generally used for services that are not straight functions
* `method` - used for methods on services and types (such as `angular.Module`, etc)
* `interface` - only used for `angular.Module` in `angular-load.js`
* `service` - used only occasionally for some angular services
* `directive` - used for angular directives
* `inputType` - used for input element specific directives (such as `input[checkbox]`)
* `event` - used for events on objects (mostly services)
* `filter` - used for angular filters (although there may be one or two that use function)

We ought to consolidate to:

* `function` - for global functions
* `object` - for global objects
* `interface` - for global interfaces
* `module` - instead of `overview` for modules
* `service` - instead of object/function for angular services
* `serviceProvider` - instead of function/object for angular service providers
* `directive` - as-is
* `filter` - as-is
* `method` - as-is
* `property` - as-is (but change angular.version to object)
* `event` - as-is
