import {DepGraph} from 'dependency-graph';

/**
 * @name  sortByDependency
 * @description                         Sort a collection of items, such that the items come before
 *                                      or after the dependencies defined on the items.
 * @param  {Array|Object}  items        The collection of items to sort.
 * @param  {string} [afterProp]         The name of the property that will hold an array of names of
 *                                      other items that the item must come after. If it is not
 *                                      defined then this property is ignored.
 * @param  {string} [beforeProp]        The name of the property that will hold an array of names of
 *                                      other items that the item must come before. If it is not
 *                                      defined then this property is ignored.
 * @param  {string} [nameProp='name']   The name of the property on the object that holds its name,
 *                                      defaults to 'name'.
 * @return {Array}                      A new array containing the sorted collection of items.
 */
export function sortByDependency<T>(items: Record<string, T>|T[], afterProp?: string, beforeProp?: string, nameProp: string = 'name'): T[] {

  const map: Record<string, T> = {};
  const depGraph = new DepGraph();

  function addDependencies(item: T, dependencyProp: string, addBefore: boolean = false) {
    if ( dependencyProp && item[dependencyProp]) {
      if ( !Array.isArray(item[dependencyProp]) ) {
        throw new Error('Error in item "' + item[nameProp] + '" - ' + dependencyProp + ' must be an array');
      }
      item[dependencyProp].forEach(dependency => {
        if ( !map[dependency] ) {
          throw new Error('Missing dependency: "' + dependency + '"  on "' + item[nameProp] + '"');
        }
        if ( addBefore ) {
          depGraph.addDependency(dependency, item[nameProp]);
        } else {
          depGraph.addDependency(item[nameProp], dependency);
        }
      });
    }
  }

  Object.keys(items).forEach(itemKey => {
    const item = items[itemKey];
    if ( !item[nameProp] ) {
      throw new Error('Missing ' + nameProp + ' property on item ' + itemKey);
    }
    map[item[nameProp]] = item;
    depGraph.addNode(item[nameProp]);
  });

  Object.values(items).forEach(item => {
    addDependencies(item, afterProp);
    addDependencies(item, beforeProp, true);
  });

  return depGraph.overallOrder().map(itemName => map[itemName]);
};
