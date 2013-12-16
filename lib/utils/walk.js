var _ = require('lodash');

/**
 * Walk the properties in an object and items in array, recursively, calling a function on each
 * property
 * @param  {object|array} items The things to process
 * @param {function} fn The function to apply to each property, recursively
 */
module.exports = function walk(items, fn) {

  function processProperty(property, key) {
    if ( _.isArray(property) || _.isObject(property) ) {
      _.forEach(_.keys(property), function(key) {
        property[key] = processProperty(property[key], key);
      });
    }
    return fn(property, key);
  }

  _.forEach(_.keys(items), function(key) {
    items[key] = processProperty(items[key], key);
  });

  return items;
};