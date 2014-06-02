module.exports = function() {
  var winston = require('winston');
  winston.cli();
  winston.level = 'info';
  return winston;
};