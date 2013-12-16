                  //  1     1     23       3   4   4 5      5  2   6  6
var PARAM_REGEX = /^\{([^}]+)\}\s+(([^\s=]+)|\[(\S+)=([^\]]+)\])\s+(.*)/; 

module.exports = function(tag, doc) {
  var match;

  if (tag.name === 'param') {
    match = PARAM_REGEX.exec(tag.text);
    if (!match) {
      throw new Error("Not a valid 'param' format: " + tag.text + ' (found in: ' + doc.file + ':' + tag.startingLine + ')');
    }

    var optional = (match[1].slice(-1) === '=');
    var param = {
      name: match[4] || match[3],
      description: match[6],
      type: optional ? match[1].substring(0, match[1].length-1) : match[1],
      optional: optional,
      default: match[5]
    };
    doc.params = doc.params || [];
    doc.params.push(param);
    return true;
  }
};