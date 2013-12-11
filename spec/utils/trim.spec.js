var trim = require('../../lib/utils/trim');

describe("trim", function() {
  it("should trim simple leading white-space from a single line of text", function() {
    expect(trim('   abc  ')).toEqual('abc  ');
  });
  it("should trim excess indentation from multi-line text ", function() {
    expect(trim('abc\n     xyz\n     123\n\n')).toEqual('abc\nxyz\n123');
    expect(trim('  abc\n     xyz\n     123\n\n')).toEqual('abc\n   xyz\n   123');
    expect(trim(' abc\n  xyz\n   123\n\n')).toEqual('abc\n xyz\n  123');
  });
  it("should remove leading empty lines", function() {
    expect(trim('\n\n\nabc')).toEqual('abc');
  });
  it("should remove trailing empty lines", function() {
    expect(trim('abc\n\n\n')).toEqual('abc');
  });
});