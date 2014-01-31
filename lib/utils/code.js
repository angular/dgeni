module.exports = function(str, inline) {
  if ( inline ) {
    return '<code>' + str + '</code>';
  } else {
    return '<pre><code>' + str + '</code></pre>';
  }
};
