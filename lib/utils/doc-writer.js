var fs = require('q-io/fs');

module.exports = {
  /**
   * Output contents to the specified file, creating folders if necessary
   * @param  {string}               file    Path of the file to write to
   * @param  {string/array/object}  content What to write into the file
   * @return {[type]}               a promise that will be resolved when all of the content has been
   *                                written.
   */
  writeFile: function(file, content) {
    return fs.makeTree(fs.directory(file)).then(function() {
      return fs.write(file, content, 'wb');
    });
  },
  /**
   * copy a file from one path to another, replacing strings matched in the replacements
   * @param  {string}  from         Path to the source file
   * @param  {string}  to           Path to the destination file
   * @param  {object?} replacements An optional object, each string in the source file that matches
   *                                a key in this object will be replaced with the corresponding
   *                                value.
   * @return {promise}              a promise that will be resolved when the destination file has
   *                                been written.
   */
  copyFile: function(from, to, replacements) {
    // We have to use binary reading, Since some characters are unicode.
    return fs.read(from).then(function(content) {
      if ( replacements ) {
        content = replaceContent(content, replacements);
      }
      return module.exports.writeFile(to, content);
    });
  },
  /**
   * Create a symlink from one file to another
   * @param  {string} from Path to the source file
   * @param  {string} to   Path to the destination file
   * @return {promise}     A promise that is resolved when the symlink has been created
   */
  linkFile: function(from, to) {
    return fs.makeTree(fs.directory(to)).then(function() {
      return fs.symbolicCopy(from, to, 'file');
    });
  },

  /**
   * Create a symlink from one folder to another
   * @param  {string} from Path to the source folder
   * @param  {string} to   Path to the destination folder
   * @return {promise}     A promise that is resolved when the symlink has been created
   */
  linkFolder: function(from, to) {
    return fs.makeTree(to).then(function() {
      return fs.symbolicCopy(from, to, 'folder');
    });
  }
  // merge:
};

/********************** Private Helpers **********************/
/**
 * Convert the parameter to a string
 * @param  {any} obj    thing to stringify
 * @return {string}     the resulting string
 */
function stringify(obj) {
  switch (typeof obj) {
  case 'string':
    return obj;
  case 'object':
    if (obj instanceof Array) {
      obj.forEach(function(value, key) {
        obj[key] = stringify(value);
      });
      return obj.join('');
    } else if (obj.constructor.name == 'Buffer'){
      // do nothing it is Buffer Object
    } else {
      return JSON.stringify(obj);
    }
  }
  return obj;
}

/* Replace placeholders in content accordingly
 * @param {string} content   content to be modified
 * @param {obj} replacements key and value pairs in which key will be replaced with value in content
 * @return {string}          content after replacement
 */
function replaceContent(content, replacements) {
  for(var key in replacements) {
    content = content.replace(key, replacements[key]);
  }
  return content;
}
