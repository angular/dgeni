                  //  1     1     23       3   4   4 5      5  2   6  6
var PARAM_REGEX = /^\{([^}]+)\}\s+(([^\s=]+)|\[(\S+)=([^\]]+)\])\s+(.*)/; 

module.exports = function(tagInfo) {
  var match;

  if (tagInfo.name === 'param') {
    match = PARAM_REGEX.exec(tagInfo.text);
    if (!match) {
      throw new Error("Not a valid 'param' format: " + tagInfo.text + ' (found in: ' + tagInfo.doc.file + ':' + tagInfo.startingLine + ')');
    }

    var optional = (match[1].slice(-1) === '=');
    var param = {
      name: match[4] || match[3],
      description: match[6],
      type: optional ? match[1].substring(0, match[1].length-1) : match[1],
      optional: optional,
      default: match[5]
    };
    tagInfo.doc.params = tagInfo.doc.params || [];
    tagInfo.doc.params.push(param);
    return true;
  }
};