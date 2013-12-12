module.exports = function(text) {
  return text.replace(/<div([^>]*)><\/div>/, '<div$1>\n<\/div>');
};