// This should be done with some kind of partial?

function explainModuleInstallation(moduleName){
  var ngMod = ngModule(moduleName),
    modulePackage = 'angular-' + moduleName,
    modulePackageFile = modulePackage + '.js';

  return '<h1>Installation</h1>' +
    '<p>First include <code>' + modulePackageFile +'</code> in your HTML:</p><pre><code>' +
    '    &lt;script src=&quot;angular.js&quot;&gt;\n' +
    '    &lt;script src=&quot;' + modulePackageFile + '&quot;&gt;</pre></code>' +

    '<p>You can download this file from the following places:</p>' +
    '<ul>' +
      '<li>[Google CDN](https://developers.google.com/speed/libraries/devguide#angularjs)<br>' +
        'e.g. <code>"//ajax.googleapis.com/ajax/libs/angularjs/X.Y.Z/' + modulePackageFile + '"</code></li>' +
      '<li>[Bower](http://bower.io)<br>' +
       'e.g. <code>bower install ' + modulePackage + '@X.Y.Z</code></li>' +
      '<li><a href="http://code.angularjs.org/">code.angularjs.org</a><br>' +
        'e.g. <code>"//code.angularjs.org/X.Y.Z/' + modulePackageFile + '"</code></li>' +
    '</ul>' +
    '<p>where X.Y.Z is the AngularJS version you are running.</p>' +
    '<p>Then load the module in your application by adding it as a dependent module:</p><pre><code>' +
    '    angular.module(\'app\', [\'' + ngMod + '\']);</pre></code>' +

    '<p>With that you\'re ready to get started!</p>';
}

function ngModule(moduleName) {
  return 'ng' + moduleName[0].toUpperCase() + moduleName.substr(1);
}

module.exports = function(text) {
  return text.replace(/{@installModule\s+(\S+)?}/g, function(_, module) {
    return explainModuleInstallation(module);
  });
};