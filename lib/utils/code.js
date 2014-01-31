module.exports = function(str, inline) {
  if ( inline ) {
    return '<code>' + str + '</code>';
  } else {
    return '<pre class="prettyprint linenum">' + str + '</pre>';
  }
};
