// Meta data used by the AngularJS docs app
angular.module('docsData', [])
  .value('NG_PAGES', [
    {% for page in docs %}{% endfor %}
  ])
  .value('NG_VERSION', '{$ doc.currentVersion $}')
  .value('NG_VERSIONS',
    {$ doc.versions | json $}
  );
