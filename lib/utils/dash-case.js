var DASH_CASE_REGEXP = /[A-Z]/g;

function dashCase(name){
  return name.replace(DASH_CASE_REGEXP, function(letter, pos) {
    return (pos ? '-' : '') + letter.toLowerCase();
  });
}

module.exports = dashCase;