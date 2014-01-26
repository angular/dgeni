// Meta data used by the AngularJS docs app
angular.module('docsData', [])
  .value('NG_PAGES', {$ doc.pages | json $})
  .value('NG_SECTIONS', {$ doc.sections | json $})
  .value('NG_VERSION', {$ doc.currentVersion | json $})
  .value('NG_VERSIONS',
    {$ doc.versions | json $}
  );
