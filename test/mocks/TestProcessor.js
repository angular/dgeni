import { helperCollection } from './helper-collection';

/**
 * A processor that will test out the system's workings
 */
export function TestProcessor(docs, config, helperCollection) {
  // do stuff to the docs using the helperCollection
  docs.forEach(function(doc, index) {
    if ( index < config.get('TestProcessor.someValue') ) {
      helperCollection.add(doc);
    }
  });
}
TestProcessor.runBefore = [];
TestProcessor.runAfter = [];
TestProcessor.config = function(config) {
  config.set('TestProcessor.someValue', 100);
};
