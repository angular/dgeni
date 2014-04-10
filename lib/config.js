var log = require('winston');
var _ = require('lodash');
var path = require('canonical-path');

/**
 * A Dgeni configuration object
 * @type Config
 * @param {Object} initialProperties An optional object of initial properties to assign to the config object
 */
function Config(initialProperties) {
  _.assign(this, initialProperties);
}

/**
 * Ensure that the give path to the specified property on the object exists and then apply
 * the given function to this property.
 * @private
 * @param  {String}   propertyPath The path to the property on the object to work with
 * @param  {Function} fn           The function to apply to the property
 * @return {*}                     The result of applying `fn` to the `property`
 */
Config.prototype.applyTo = function(propertyPath, fn) {

  // Parse the property path to access to property to update
  var parts = propertyPath.split('.');
  var property = parts.pop();
  var container = _.reduce(parts, function(obj, prop) { return obj[prop] || (obj[prop] = {}); }, this);

  return fn(container, property);
};

/**
 * Set a property on the config object
 * @param {String} propertyPath The path to the property to set
 * @param {*} newValue          The new value to set on this property
 */
Config.prototype.set = function(propertyPath, newValue) {
  this.applyTo(propertyPath, function (container, property) {
    container[property] = newValue;
  });
};

/**
 * Get a property on the config object
 * @param  {String} propertyPath The path to the property to get
 * @param  {*} defaultVal        The value to return if this property does not exist
 * @return {*}                   The value of the property or `defaultVal` if the property does not exist
 */
Config.prototype.get = function(propertyPath, defaultVal) {
  var parts = propertyPath.split('.');
  var property = this;
  if ( _.all(parts, function(prop) { property = property[prop]; return property; }) ) {
    return property;
  }
  return defaultVal;
};

/**
 * Prepend one or more values to a collection on the config object. If there is no collection defined
 * then a new one is created. If the `values` is an array then each item in the array is prepended to the
 * collection.  Otherwise `values` itself is prepended to the collection.
 * @param  {String} propertyPath The path to the property to update
 * @param  {*|Array} values      The value(s) to prepend to the collection
 */
Config.prototype.prepend = function(propertyPath, values) {
  this.applyTo(propertyPath, function (container, property) {
    container[property] = container[property] || [];
    values = _.isArray(values) ? values : [values];
    Array.prototype.unshift.apply(container[property], values);
  });
};

/**
 * Append one or more values to a collection on the config object. If there is no collection defined
 * then a new one is created. If the `values` is an array then each item in the array is appended to the
 * collection.  Otherwise `values` itself is appended to the collection.
 * @param  {String} propertyPath The path to the property to update
 * @param  {*|Array} values      The value(s) to prepend to the collection
 */
Config.prototype.append = function(propertyPath, values) {
  this.applyTo(propertyPath, function (container, property) {
    container[property] = container[property] || [];
    values = _.isArray(values) ? values : [values];
    Array.prototype.push.apply(container[property], values);
  });
};

/**
 * Merge an object into the object found at the `propertyPath` in the config object.  Properties
 * in the `extraProperties` object override those found in the object at the properyPath.
 * If no object exists at the `propertyPath` then it will be initialized to an empty object before
 * merging in the `extraProperties`
 * @param  {String} propertyPath The path to the property to update
 * @param  {Object} extraProperties The object to merge into the object found at `propertyPath`
 */
Config.prototype.merge = function(propertyPath, extraProperties) {
  this.applyTo(propertyPath, function (container, property) {
    container[property] = container[property] || {};
    _.assign(container[property], extraProperties);
  });
};


// Much of this file is borrowed from Karma.
// See https://github.com/karma-runner/karma/blob/master/lib/config.js

var CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
                         '    config.append("a.b.c", newValues);\n' +
                         '    config.set("some.otherProp", value);\n' +
                         '    return config;\n' +
                         '  };\n';

/**
 * Load a config object from a configuration file. The file should be a node moduleof the form:
 * ```
 *  module.exports = function(config) {
 *    config.append("a.b.c", newValues);
 *    config.set("some.otherProp", value);
 *    return config;
 *  };
 * ```
 * @param  {String} configFilePath Path to a file we should load.
 * @param  {Config} config         An optional config object that we should overide with what is loaded
 *                                 from the config file.
 * @return {Config}                A newly configured config object
 */
function load(configFilePath, config) {

  var configModule;

  if (!configFilePath) {
    throw new Error('No config file specified.');
  }


  // Default configuration
  config = config || new Config();

  if ( ! (config instanceof Config) ) {
    throw new Error('The config parameter must be an instance of Config.');
  }

  configFilePath = path.resolve(configFilePath);

  log.info('Loading config %s', configFilePath);

  try {
    configModule = require(configFilePath);
  } catch(e) {
    if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(configFilePath) !== -1) {
      throw new Error('File "'+ configFilePath + '" does not exist!');
    } else {
      throw new Error('Invalid config file!\n  ' + e.stack);
    }
  }

  if (!_.isFunction(configModule)) {
    throw new Error('Config file must export a function!\n' + CONFIG_SYNTAX_HELP);
  }

  // Provide a default basePath
  config.basePath = path.dirname(configFilePath);

  try {
    config = configModule(config);

    if ( ! (config instanceof Config) ) {
      throw new Error('Config file export function must return an instance of Config.\n' +
        'Instead it returned an object of type ' + config.constructor.name);
    }

    log.cli();
    log.level = config.get('logging.level', 'info');
    log.info('Read config from "' + configFilePath + '"');
    log.info('Logging set to "' + log.level + '"');
    log.debug('basePath: ', config.get('basePath'));

    return config;

  } catch(e) {
    throw new Error('Error in config file!\n' + e.message + '\n' + e.stack);
  }
}

/**
 * @module lib/config
 */
module.exports = {
  load: load,
  Config: Config
};
