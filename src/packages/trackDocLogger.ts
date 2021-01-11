import cloneDeep from 'clonedeep';
import deepEqual from 'fast-deep-equal';
import {Package} from '../Package';

interface TrackDocLoggerOptions {
  docsToTrackFn(docs: any[]): any[]|undefined;
}
const options: TrackDocLoggerOptions = {
  docsToTrackFn(docs) { return undefined; }
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
      if ( !deepEqual(trackedDocs, previousTrackedDocs) ) {
        trackedDocs = cloneDeep(trackedDocs);
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