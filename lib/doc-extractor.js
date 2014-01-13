var path = require('canonical-path');
var Q = require('q');
var gfs = require('graceful-fs');
var qfs = require('q-io/fs');
var _ = require('lodash');
var glob = require('glob');
var log = require('winston');

module.exports = function fileReaderFactory(extractors) {
  /**
   * Read the documents from aspecified files
   * @param  {Array} files                      Array of glob patterns or objects containing a glob pattern and basePath
   * @return {promise}                          A promise to an array of docs that have been extracted
   */
  return function(files) {

    return Q.all(_.map(files, function(fileInfo) {
      var basePath, pattern, files;

      if ( _.isString(fileInfo) ) {
        basePath = process.cwd();
        pattern = fileInfo;
      } else if ( _.isObject(fileInfo) ) {
        basePath = fileInfo.basePath || process.cwd();
        pattern = fileInfo.pattern;
      } else {
        throw new Error('Invalid files parameter. ' +
          'You must pass an array of items, each of which is either a string or an object of the form ' +
          '{ pattern: "...", basePath: "..." }');
      }

      log.debug('reading files from ', basePath, path.relative(basePath, pattern));

      files = glob.sync(pattern, { cwd: basePath });

      log.debug('Found ' + files.length + ' files');

      var docPromises = [];
      _.forEach(files, function(file) {
        _.any(extractors, function(extractor) {
          if ( extractor.pattern.test(file) ) {
            docPromises.push(qfs.read(path.resolve(basePath, file)).then(function(content) {
              return extractor.processFile(file, content, basePath);
            }));
            return true;
          }
        });
      });

      return Q.all(docPromises).then(_.flatten);
    }))
    
    .then(_.flatten);
  };
};