module.exports = function(str, inline, lang) {
  
  // If a language is provided then attach a CSS class to the code element
  if ( lang ) {
    lang = ' class="lang-' + lang + '"';
  }

  str = '<code' + lang + '>' + str + '</code>';

  // If not inline then wrap the code element in a pre element
  if ( !inline ) {
    str = '<pre>' + str + '</pre>';
  }

  return str;
};
