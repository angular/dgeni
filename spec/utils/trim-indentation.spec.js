var trimIndentation = require('../../lib/utils/trim-indentation');

describe("trim-indentation", function() {
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
    expect(trimIndentation('\n\n\n   abc')).toEqual('abc');
  });
  it("should remove trailing empty lines", function() {
    expect(trimIndentation('abc\n\n\n')).toEqual('abc');
  });

  describe("calcIndent", function() {
    it("should calculate simple leading white-space from a single line of text", function() {
      expect(trimIndentation.calcIndent('   abc  ')).toEqual(3);
    });
    it("should trim excess indentation from multi-line text ", function() {
      expect(trimIndentation.calcIndent('abc\n     xyz\n     123\n\n')).toEqual(5);
      expect(trimIndentation.calcIndent('  abc\n     xyz\n     123\n\n')).toEqual(2);
      expect(trimIndentation.calcIndent(' abc\n  xyz\n   123\n\n')).toEqual(1);
    });
  });

  describe("reindent", function() {
    it("should add whitespace to the start of each line", function() {
      expect(trimIndentation.reindent('abc\n  xyz', 4)).toEqual('    abc\n      xyz');
    });
  });
});