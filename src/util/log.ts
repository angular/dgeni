/**
 * @dgService log
 * @kind object
 * @description
 * A service for logging what the dgeni is up to
 */
export function logFactory() {
  const winston = require('winston');
  winston.cli();
  winston.level = 'info';
  return winston;
};
