const {expect, spy} = require('chai').use(require('chai-spies'));
import {logFactory} from './log';

describe('log', function() {
  it('should wrap the winston library', function() {

    const winston = require('winston');
    spy.on(winston, 'cli');
    logFactory();
    expect(winston.cli).to.have.been.called();
    expect(winston.level).to.equal('info');
  });
});