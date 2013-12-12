/**
 * ensure that empty divs contain a new line
 */
module.exports = function(text) {
  return text.replace(/<div([^>]*)><\/div>/gi, '<div$1>\n<\/div>');
};