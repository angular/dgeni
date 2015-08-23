var _ = require('lodash');
var Package = require('../Package');
var diff = require('objectdiff').diff;
var firstDocs, startDocs, endDocs, lastDocs;
var options = {
  start: null,
  end: null
};

module.exports = new Package('docDiffLogger')

.factory('docDiffLoggerOptions', function() {
  return options;
})

.eventHandler('processorStart', function() {
  return function capturePreviousDocs(event, processor, docs) {
    firstDocs = firstDocs || _.cloneDeep(docs);

    if ( options.start === processor.name ) {
      startDocs = _.cloneDeep(docs);
    }
  };
})

.eventHandler('processorEnd', function(log) {
  return function(event, processor, docs) {
    lastDocs = docs;

    if ( options.end === processor.name ) {
      endDocs = _.cloneDeep(docs);
      logDiff(log);
    }
  };
})

.eventHandler('generationEnd', function(log) {
  return function() {
    if ( options.start && !startDocs ) {
      throw new Error('docDiffLogger: missing start processor');
    }
    if ( options.end && !endDocs ) {
      throw new Error('docDiffLogger: missing end processor');
    }
    if ( !options.end ) {
      logDiff(log);
    }
  };
});


function logDiff(log) {
  var changes = diff(startDocs || firstDocs, endDocs || lastDocs);
  log.info(options);
  log.info(changes);
}