var IS_URL = /^(https?:\/\/|ftps?:\/\/|mailto:|\.|\/)/,
    IS_ANGULAR = /^(api\/)?(angular|ng|AUTO)\./,
    IS_HASH = /^#/,
    EXAMPLES_SPLITTER = /(<pre.*?>[\s\S]*?<\/pre>|<doc:example(\S*).*?>[\s\S]*?<\/doc:example>|<example[^>]*>[\s\S]*?<\/example>)/;
    LAST_DOCS_TAG = /\/\/<docs.*?>([.\s\S]+)\/\/<\/docs>/im;

function extractInlineDocCode(text, tag) {
  var regex, matches;
  if(tag == 'all') {
    //use a greedy operator to match the last </docs> tag
    regex = LAST_DOCS_TAG;
  } else {
    //use a non-greedy operator to match the next </docs> tag
    regex = new RegExp("\/\/<docs\\s*tag=\"" + tag + "\".*?>([.\\s\\S]+?)\/\/<\/docs>","im");
  }
  matches = regex.exec(text.toString());
  return matches && matches.length > 1 ? matches[1] : "";
}

function placeholder(text, placeholderMap) {
  var id = 'REPLACEME' + (seq++);
  placeholderMap[id] = text;
  return id;
}

function prepareClassName(text) {
  return text.toLowerCase().replace(/[_\W]+/g, '-');
}

function parseMarkdown(text, doc) {
  if (!text) return text;

  var parts = trim(text).split(EXAMPLES_SPLITTER),
      seq = 0,
      placeholderMap = {};

  parts.forEach(function(text, i) {
    parts[i] = (text || '').
      replace(/<example(?:\s+module="([^"]*)")?(?:\s+deps="([^"]*)")?(\s+animations="true")?>([\s\S]*?)<\/example>/gmi,
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
          return '';
        })
        return placeholder(example.toHtml());
      }).
      replace(/(?:\*\s+)?<file.+?src="([^"]+)"(?:\s+tag="([^"]+)")?\s*\/?>/i, function(_, file, tag) {
        if(fs.existsSync(file)) {
          var content = fs.readFileSync(file, 'utf8');
          if(tag && tag.length > 0) {
            content = extractInlineDocCode(content, tag);
          }
          return content;
        }
      }).
      replace(/^<doc:example(\s+[^>]*)?>([\s\S]*)<\/doc:example>/mi, function(_, attrs, content) {
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

        return placeholder(example.toHtml());
      }).
      replace(/^<pre(.*?)>([\s\S]*?)<\/pre>/mi, function(_, attrs, content){
        return placeholder(
          '<pre'+attrs+' class="prettyprint linenums">' +
            content.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
            '</pre>');
      }).
      replace(/<div([^>]*)><\/div>/, '<div$1>\n<\/div>').
      replace(/{@link\s+([^\s}]+)\s*([^}]*?)\s*}/g, function(_all, url, title){
        var isFullUrl = url.match(IS_URL),
          isAngular = url.match(IS_ANGULAR),
          isHash = url.match(IS_HASH),
          absUrl = isHash
            ? url
            : (isFullUrl ? url : doc.convertUrlToAbsolute(url));

        if (!isFullUrl) doc.links.push(absUrl);

        return '<a href="' + absUrl + '">' +
          (isAngular ? '<code>' : '') +
          (title || url).replace(/^#/g, '').replace(/\n/g, ' ') +
          (isAngular ? '</code>' : '') +
          '</a>';
      }).
      replace(/{@type\s+(\S+)(?:\s+(\S+))?}/g, function(_, type, url) {
        url = url || '#';
        return '<a href="' + url + '" class="' + doc.prepare_type_hint_class_name(type) + '">' + type + '</a>';
      }).
      replace(/{@installModule\s+(\S+)?}/g, function(_, module) {
        return explainModuleInstallation(module);
      });
  });
  text = parts.join('');

  var pageClassName, suffix = '-page';
  if(doc.name) {
    var split = doc.name.match(/^\s*(.+?)\s*:\s*(.+)/);
    if(split && split.length > 1) {
      var before = prepareClassName(split[1]);
      var after = prepareClassName(split[2]);
      pageClassName = before + suffix + ' ' + before + '-' + after + suffix;
    }
  }
  pageClassName = pageClassName || prepareClassName(doc.name || 'docs') + suffix;

  text = '<div class="' + pageClassName + '">' + marked(text) + '</div>';
  text = text.replace(/(?:<p>)?(REPLACEME\d+)(?:<\/p>)?/g, function(_, id) {
    return placeholderMap[id];
  });

  //!annotate CONTENT
  //!annotate="REGEX" CONTENT
  //!annotate="REGEX" TITLE|CONTENT
  text = text.replace(/\n?\/\/!annotate\s*(?:=\s*['"](.+?)['"])?\s+(.+?)\n\s*(.+?\n)/img,
    function(_, pattern, content, line) {
      var title, text, split = content.split(/\|/);
      pattern = new RegExp(pattern || '.+');
      if(split.length > 1) {
        text = split[1];
        title = split[0];
      } else {
        title = 'Info';
        text = content;
      }
      return "\n" + line.replace(pattern, function(match) {
        return '<div class="nocode nocode-content" data-popover ' +
                 'data-content="' + text + '" ' +
                 'data-title="' + title + '">' +
                    match +
               '</div>';
      });
    }
  );

  //!details /path/to/local/docs/file.html
  //!details="REGEX" /path/to/local/docs/file.html
  text = text.replace(/\/\/!details\s*(?:=\s*['"](.+?)['"])?\s+(.+?)\n\s*(.+?\n)/img,
    function(_, pattern, url, line) {
      url = '/notes/' + url;
      pattern = new RegExp(pattern || '.+');
      return line.replace(pattern, function(match) {
        return '<div class="nocode nocode-content" data-foldout data-url="' + url + '">' + match + '</div>';
      });
    }
  );

  return text;
}

module.exports = parseMarkdown;