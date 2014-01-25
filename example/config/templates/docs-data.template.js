// Meta data used by the AngularJS docs app
angular.module('docsData', [])
  .value('NG_PAGES', [
    {% for page in doc.pages -%}
      { "section":"{$ page.section $}","id":"{$ page.id $}","name":"{$ page.name $}","type":"{$ page.docType $}","module":"{$ doc.module $}","shortDescription":"{$ description | firstLine $}","keywords":""},
    {% endfor -%}
  ])
  .value('NG_VERSION', '{$ doc.currentVersion $}')
  .value('NG_VERSIONS',
    {$ doc.versions | json $}
  );
