var vm = require('vm');
var fs = require('fs');
var _ = require('lodash');
var log = require('winston');

module.exports = function loadConfig(configFilePath, defaultConfig) {
  log.info('loading config', configFilePath);
  // Load in the config file and run it over the top of the default config
  var config = _.cloneDeep(defaultConfig);
  var configFile = fs.readFileSync(configFilePath);
  vm.runInNewContext(configFile, config, configFilePath);
  log.debug('default config:', defaultConfig);
  log.debug('loaded config:', config);
  return config;
};