var fs = require('fs');

function extractInlineDocCode(text, tag) {
  if(tag == 'all') {
    //use a greedy operator to match the last </docs> tag
    regex = /\/\/<docs.*?>([.\s\S]+)\/\/<\/docs>/im;
  }
  else {
    //use a non-greedy operator to match the next </docs> tag
    regex = new RegExp("\/\/<docs\\s*tag=\"" + tag + "\".*?>([.\\s\\S]+?)\/\/<\/docs>","im");
  }
  var matches = regex.exec(text.toString());
  return matches && matches.length > 1 ? matches[1] : "";
}

module.exports = function(text) {
  return text.replace(/(?:\*\s+)?<file.+?src="([^"]+)"(?:\s+tag="([^"]+)")?\s*\/?>/i, function(_, file, tag) {
    if(fs.existsSync(file)) {
      var content = fs.readFileSync(file, 'utf8');
      if(tag && tag.length > 0) {
        content = extractInlineDocCode(content, tag);
      }
      return content;
    }
  });
};
