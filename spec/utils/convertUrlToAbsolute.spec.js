var convertUrlToAbsolute = require('../../lib/utils/convert-url-to-absolute');

describe('convertUrlToAbsolute', function() {
  it('should not change absolute url', function() {
    expect(convertUrlToAbsolute('guide/index', { section: 'guide' })).toEqual('guide/index');
  });

  it('should prepend current section to relative url', function() {
    expect(convertUrlToAbsolute('angular.widget', { section: 'section' })).toEqual('section/angular.widget');
  });

  it('should change id to index if not specified', function() {
    expect(convertUrlToAbsolute('guide/', {section: 'guide'})).toEqual('guide/index');
  });
});

