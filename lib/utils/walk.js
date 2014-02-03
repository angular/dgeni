var _ = require('lodash');

/**
 * Walk the properties in an object and items in array, recursively, calling a function on each
 * property
 * @param  {object|array} items The things to process
 * @param {function} fn The function (of the form `function(property, key) { return newProperty; }`) to apply to each property, recursively
 */
module.exports = function walk(items, fn) {

  // We need to track what objects have been walked to account for circular references
  var parsedObjects = [items];

  function processProperty(property, key) {
    if ( _.isArray(property) || _.isObject(property) ) {
      if ( parsedObjects.indexOf(property) === -1 ) {
        parsedObjects.push(property);
        _.forEach(_.keys(property), function(key) {
          property[key] = processProperty(property[key], key);
        });
      }
    }
    return fn(property, key);
  }

  _.forEach(_.keys(items), function(key) {
    items[key] = processProperty(items[key], key);
  });

  return items;
};