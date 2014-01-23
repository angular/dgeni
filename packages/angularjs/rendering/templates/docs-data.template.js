// Meta data used by the AngularJS docs app
angular.module('docsData', [])
  .value('NG_PAGES',
    {% for page in pages %}{% endfor %}
  )
  .value('NG_VERSION', {$ currentVersion $})
  .value('NG_VERSIONS',
    {$ versions | json $}
  );
