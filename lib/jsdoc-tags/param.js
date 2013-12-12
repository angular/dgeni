                  //  1     1     23       3   4   4 5      5  2   6  6
var PARAM_REGEX = /^\{([^}]+)\}\s+(([^\s=]+)|\[(\S+)=([^\]]+)\])\s+(.*)/; 

module.exports = function(currentTag, doc, line, parseContent) {
  var match;

  if (currentTag.name === 'param') {
    match = PARAM_REGEX.exec(text);
    if (!match) {
      throw new Error("Not a valid 'param' format: " + text + ' (found in: ' + doc.file + ':' + line + ')');
    }

    var optional = (match[1].slice(-1) === '=');
    var param = {
      name: match[4] || match[3],
      description: parseContent(text.replace(match[0], match[6]), doc),
      type: optional ? match[1].substring(0, match[1].length-1) : match[1],
      optional: optional,
      default: match[5]
    };
    doc.params = doc.params || [];
    doc.params.push(param);
    return true;
  }
};