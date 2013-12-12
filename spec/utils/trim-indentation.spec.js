var trimIndentation = require('../../lib/utils/trim-indentation');

describe("trim", function() {
  it("should trim simple leading white-space from a single line of text", function() {
    expect(trimIndentation('   abc  ')).toEqual('abc  ');
  });
  it("should trim excess indentation from multi-line text ", function() {
    expect(trimIndentation('abc\n     xyz\n     123\n\n')).toEqual('abc\nxyz\n123');
    expect(trimIndentation('  abc\n     xyz\n     123\n\n')).toEqual('abc\n   xyz\n   123');
    expect(trimIndentation(' abc\n  xyz\n   123\n\n')).toEqual('abc\n xyz\n  123');
  });
  it("should remove leading empty lines", function() {
    expect(trimIndentation('\n\n\nabc')).toEqual('abc');
  });
  it("should remove trailing empty lines", function() {
    expect(trimIndentation('abc\n\n\n')).toEqual('abc');
  });
});