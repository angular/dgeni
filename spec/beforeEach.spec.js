var log = require('winston');

log.remove(log.transports.Console);


//TODO: Add a custom transport that logs to an array