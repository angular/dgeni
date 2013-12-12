var Example = require('./Example.js');

function extractInlineDocCode(text, tag) {
  if(tag == 'all') {
    //use a greedy operator to match the last </docs> tag
    regex = /\/\/<docs.*?>([.\s\S]+)\/\/<\/docs>/img;
  }
  else {
    //use a non-greedy operator to match the next </docs> tag
    regex = new RegExp("\/\/<docs\\s*tag=\"" + tag + "\".*?>([.\\s\\S]+?)\/\/<\/docs>","im");
  }
  var matches = regex.exec(text.toString());
  return matches && matches.length > 1 ? matches[1] : "";
}

module.exports = function(text, doc) {
  return text.replace(/<example(?:\s+module="([^"]*)")?(?:\s+deps="([^"]*)")?(\s+animations="true")?>([\s\S]*?)<\/example>/gmi,

    function(_, module, deps, animations, content) {
      var example = new Example(doc.scenarios);
      if(animations) {
        example.enableAnimations();
        example.addDeps('angular-animate.js');
      }

      example.setModule(module);
      example.addDeps(deps);

      content.replace(/<file\s+name="([^"]*)"\s*>([\s\S]*?)<\/file>/gmi, function(_, name, content) {
        example.addSource(name, content);
      });

      content.replace(/<file\s+src="([^"]+)"(?:\s+tag="([^"]+)")?(?:\s+name="([^"]+)")?\s*\/?>/gmi, function(_, file, tag, name) {
        if(fs.existsSync(file)) {
          var content = fs.readFileSync(file, 'utf8');
          if(content && content.length > 0) {
            if(tag && tag.length > 0) {
              content = extractInlineDocCode(content, tag);
            }
            name = name && name.length > 0 ? name : fspath.basename(file);
            example.addSource(name, content);
          }
        }
      });
      return placeholderMap.add(doc, example.toHtml());
    }
  );
};
