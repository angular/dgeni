const _ = require('lodash');
import {Package} from '../Package';
const options = {
  docsToTrackFn: function(docs) {}
};

const generations = [];
let previousTrackedDocs;

export const trackDocLoggerPackage = new Package('trackDocLogger')

.factory('trackDocLoggerOptions', function() {
  return options;
})

.eventHandler('processorEnd', function() {
  return function(event, processor, docs) {
    let trackedDocs = options.docsToTrackFn(docs);
    if ( trackedDocs ) {
      if ( !_.isEqual(trackedDocs, previousTrackedDocs) ) {
        trackedDocs = _.cloneDeep(trackedDocs);
        generations.push({ processor: processor.name, docs: trackedDocs });
        previousTrackedDocs = trackedDocs;
      }
    }
  };
})

.eventHandler('generationEnd', function(log) {
  return function() {
    log.info('trackDocLogger settings:', options);
    log.info('trackDocLogger tracked changes:', generations);
  };
});