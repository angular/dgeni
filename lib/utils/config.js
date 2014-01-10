var log = require('winston');
var _ = require('lodash');
var path = require('canonical-path');

// Much of this file is borrowed from Karma.
// See https://github.com/karma-runner/karma/blob/master/lib/config.js

var CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
                         '    return config;\n' +
                         '  };\n';

module.exports = function loadConfig(configFilePath, defaultConfig) {
  var configModule;
  if (configFilePath) {
    log.debug('Loading config %s', configFilePath);

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
    log.debug('No config file specified.');
    // if no config file path is passed, we define a dummy config module.
    configModule = function() {};
  }

  var config = _.clone(defaultConfig, true);
  config.basePath = path.resolve(path.dirname(configFilePath));

  try {
    return configModule(config);
  } catch(e) {
    throw new Error('Error in config file!\n' + e.message + '\n' + e.stack);
  }
};
