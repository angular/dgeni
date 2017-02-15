import {Dgeni} from './Dgeni';
export {Processor} from './Processor';
export {Document} from './Document';
export {DocCollection} from './DocCollection';
export {Dgeni} from './Dgeni';
export {Package} from './Package';
export {Module} from './Module';

// This is a hack so that you can still require Dgeni
// in CommonJS as: `var Dgeni = require('dgeni');`
module.exports = Dgeni;
module.exports.Dgeni = Dgeni;
