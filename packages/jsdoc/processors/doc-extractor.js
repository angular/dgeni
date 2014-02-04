var path = require('canonical-path');
var Q = require('q');
var gfs = require('graceful-fs');
var qfs = require('q-io/fs');
var _ = require('lodash');
var glob = require('glob');
var log = require('winston');

var basePath, extractors, sourceFiles;

module.exports = {
  name: 'file-extractor',
  description: 'A doc processor that extracts documents from files and adds them to the docs array',
  runAfter: ['loading-files'],
  runBefore: ['files-loaded'],

  init: function(config, injectables) {

    basePath = config.basePath || process.cwd();
    extractors = config.source.extractors;
    sourceFiles = config.source.files;
  },

  process: function(docs) {

    return Q.all(_.map(sourceFiles, function(fileInfo) {
      var pattern, files;

      // These fileinfo patterns and basePaths should be relative to the basePath but if we don't have
      // a basepath specified then we just use the config.basePath or current working directory 
      if ( _.isString(fileInfo) ) {
        fileInfo = { pattern: fileInfo, basePath: basePath };
      } else if ( _.isObject(fileInfo) ) {
        fileInfo.basePath = fileInfo.basePath || basePath;
      } else {
        throw new Error('Invalid files parameter. ' +
          'You must pass an array of items, each of which is either a string or an object of the form ' +
          '{ pattern: "...", basePath: "..." }');
      }

      // Ensure that the pattern is relative
      fileInfo.pattern = path.relative(fileInfo.basePath, path.resolve(fileInfo.basePath, fileInfo.pattern));

      log.debug('reading files: ', fileInfo);

      files = glob.sync(fileInfo.pattern, { cwd: fileInfo.basePath });

      log.debug('Found ' + files.length + ' files');

      var docPromises = [];
      _.forEach(files, function(file) {
        _.any(extractors, function(extractor) {
          if ( extractor.pattern.test(file) ) {
            docPromises.push(qfs.read(path.resolve(fileInfo.basePath, file)).then(function(content) {
              var docs = extractor.processFile(file, content, fileInfo.basePath);
              
              _.forEach(docs, function(doc) {
                doc.fileName = path.basename(doc.file, '.'+doc.fileType);
              });

              return docs;
            }));
            return true;
          }
        });
      });

      return Q.all(docPromises).then(_.flatten);
    }))
    
    .then(_.flatten);
  }
};