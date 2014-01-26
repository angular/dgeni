// Meta data used by the AngularJS docs app
angular.module('docsData', [])
  .value('NG_PAGES', {$ doc.pages | json $})
  .value('NG_VERSION', '{$ doc.currentVersion $}')
  .value('NG_VERSIONS',
    {$ doc.versions | json $}
  );
