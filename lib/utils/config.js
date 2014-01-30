var log = require('winston');
var _ = require('lodash');
var path = require('canonical-path');

var Config = {
  applyTo: function(propertyPath, fn) {

    // Parse the property path to access to property to update
    var parts = propertyPath.split('.');
    var property = parts.pop();
    var container = _.reduce(parts, function(obj, prop) { return obj[prop] || (obj[prop] = {}); }, this);

    return fn(container, property);
  },
  set: function(propertyPath, newValue) {
    this.applyTo(propertyPath, function (container, property) {
      container[property] = newValue;
    });
  },
  get: function(propertyPath, defaultVal) {
    var parts = propertyPath.split('.');
    var property = this;
    if ( _.all(parts, function(prop) { property = property[prop]; return property; }) ) {
      return property;
    }
    return defaultVal;
  },
  prepend: function(propertyPath, values) {
    this.applyTo(propertyPath, function (container, property) {
      container[property] = container[property] || [];
      values = _.isArray(values) ? values : [values];
      Array.prototype.unshift.apply(container[property], values);
    });
  },
  append: function(propertyPath, values) {
    this.applyTo(propertyPath, function (container, property) {
      container[property] = container[property] || [];
      values = _.isArray(values) ? values : [values];
      Array.prototype.push.apply(container[property], values);
    });
  },
  merge: function(propertyPath, extraProperties) {
    this.applyTo(propertyPath, function (container, property) {
      container[property] = container[property] || {};
      _.assign(container[property], extraProperties);
    });
  }
};

var defaultConfig = _.create(Config, {

  source: {
    files : [],
    extractors: []
  },

  processing: {
    processors: [],
    tagDefinitions: []
  },

  rendering: {
    templateFolders: [],
    templatePatterns: [],
    filters: [],
    tags: []
  },

  logging: {
    level: 'info'
  }
});


// Much of this file is borrowed from Karma.
// See https://github.com/karma-runner/karma/blob/master/lib/config.js

var CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
                         '    config.append("a.b.c", newValues);\n' +
                         '    config.set("some.otherProp", value);\n' +
                         '    return config;\n' +
                         '  };\n';

function loadConfig(configFilePath, config) {

  var configModule;

  // Default configuration
  config = config || defaultConfig;

  if (configFilePath) {
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
  } else {
    log.warn('No config file specified.');
    // if no config file path is passed, we define a dummy config module.
    configModule = function(config) { return config; };
  }

  // Provide a default basePath
  config.basePath = path.dirname(configFilePath);

  try {
    return configModule(config);
  } catch(e) {
    throw new Error('Error in config file!\n' + e.message + '\n' + e.stack);
  }
}

module.exports = {
  load: loadConfig,
  Config: Config
};
