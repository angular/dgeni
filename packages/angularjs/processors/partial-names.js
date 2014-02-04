var PartialNames = require('../../../lib/utils/partial-names').PartialNames;

module.exports = {
  name: 'partial-names',
  runBefore: ['loading-files'],
  init: function(config, injectables) {
    injectables.value('partialNames', new PartialNames());
  }
};