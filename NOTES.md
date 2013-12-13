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