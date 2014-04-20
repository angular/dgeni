import { Inject } from '../../src/di';
import { helperCollection } from './helper-collection';

/**
 * A processor that will test out the system's workings
 */
@Inject('docs', 'config', helperCollection)
export function testProcessor(docs, config, helperCollection) {
  // do stuff to the docs using the helperCollection
  docs.forEach(function(doc, index) {
    if ( index < config.get('TestProcessor.someValue') ) {
      helperCollection.add(doc);
    }
  });
}
testProcessor.runBefore = [];
testProcessor.runAfter = [];
testProcessor.config = function(config) {
  config.set('TestProcessor.someValue', 100);
};
