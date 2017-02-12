const {expect, spy} = require('chai').use(require('chai-spies'));

import {getInjectablesFactory} from './getInjectables';

describe('getInjectables', function() {

  let mockInjector;
  let getInjectables;

  beforeEach(function() {
    mockInjector = spy.object({ invoke: fn => fn() });
    getInjectables = getInjectablesFactory(mockInjector);
  });

  it('should call invoke on the injector for each factory', function() {

    function a() { return {}; }
    function b() { return {}; }
    function c() { return {}; }

    getInjectables([a, b, c]);
    expect(mockInjector.invoke).to.have.been.called.exactly(3);
  });

  it('should get the name from the instance, then the factory', function() {
    function a() { return {}; }
    function b() { return function b2() {}; }
    function c() { return { name: 'c2' }; }

    const instances = getInjectables([a, b, c]);
    expect(instances[0].name).to.equal('a');
    expect(instances[1].name).to.equal('b2');
    expect(instances[2].name).to.equal('c2');
  });
});