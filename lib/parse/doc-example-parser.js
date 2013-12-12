var Example = require('./Example.js');

module.exports = function(doc, text) {
  return text.replace(/^<doc:example(\s+[^>]*)?>([\s\S]*)<\/doc:example>/mi, function(_, attrs, content) {
    var html, script, scenario,
      example = new Example(doc.scenarios);

    example.setModule((attrs||'module=""').match(/^\s*module=["'](.*)["']\s*$/)[1]);
    content.
      replace(/<doc:source(\s+[^>]*)?>([\s\S]*)<\/doc:source>/mi, function(_, attrs, content) {
        example.addSource('index.html', content.
          replace(/<script>([\s\S]*)<\/script>/mi, function(_, script) {
            example.addSource('script.js', script);
            return '';
          }).
          replace(/<style>([\s\S]*)<\/style>/mi, function(_, style) {
            example.addSource('style.css', style);
            return '';
          })
        );
      }).
      replace(/(<doc:scenario>)([\s\S]*)(<\/doc:scenario>)/mi, function(_, before, content){
        example.addSource('scenario.js', content);
      });

    return placeholderMap.add(doc, example.toHtml());
  });
};
