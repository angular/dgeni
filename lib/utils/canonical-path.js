var path = require('path');

/**
 * Function to ensure that file paths use forward slashes (whatever OS)
 * @param  {string} path The path to canonicalise
 * @return {string}      The canonicalised path
 */
module.exports = function canonicalPath(filePath) {
  if( path.sep === '\\') {
    filePath = filePath.replace(/\\/g, '/');
  }
  return filePath;
};

