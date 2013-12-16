var _ = require('lodash');

/**
 * Apply the callback to each of the properties in the object, recursively down through enumerable properties
 * @param  {object|array} items The collection to process
 * @param {function} fn The function to apply to each item and child items
 */
module.exports = function forEachRecursive(items, fn) {

  /**
   * Recurse into the property apply the fn as appropriate
   * @param  {*} property The value of the property to process
   * @return {*}          The new value for the proeprty
   */
  function processProperty(property) {
    if ( _.isArray(property) || _.isObject(property) ) {
      _.forEach(_.keys(property), function(key) {
        property[key] = processProperty(property[key]);
      });
      return property;
    } else {
      return fn(property);
    }
  }

  _.forEach(_.keys(items), function(key) {
    items[key] = processProperty(items[key]);
  });

  return items;
};