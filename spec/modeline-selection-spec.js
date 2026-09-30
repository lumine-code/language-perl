const fs = require("fs");
const path = require("path");

describe("PERL modeline selection", () => {
  let grammar;

  beforeEach(async () => {
    const pkg = await lumine.packages.activatePackage("language-perl");
    expect(fs.realpathSync(pkg.path)).toBe(path.resolve(__dirname, ".."));
    grammar = lumine.grammars.grammarForScopeName("source.perl");
  });

  it("selects extensionless files from Vim filetype, ft, and syntax modelines", () => {
    for (const key of ["filetype", "ft", "syntax"]) {
      const text = "// vim: set tabstop=4 set " + key + "=perl:";
      expect(lumine.grammars.selectGrammar("modeline", text).scopeName).toBe("source.perl");
    }
  });

  it("preserves token order and modelines on a later supplied prefix line", () => {
    expect(grammar.firstLineRegex.test("vim: ft=perl")).toBe(false);
    expect(grammar.firstLineRegex.test("ft=perl // vim: set tabstop=4")).toBe(false);
    expect(grammar.firstLineRegex.test("preceding line\n// vim: set ft=perl:")).toBe(true);
  });

  it("keeps failed modelines from revisiting Vim and set tokens", () => {
    expect(grammar.firstLineRegex.source).toContain("(?:(?!vim\\b).)*vim\\b");
    expect(grammar.firstLineRegex.source).toContain("(?:(?!\\bset\\b).)*\\bset\\b");
    for (const text of ["vim " + " set ".repeat(16000) + "x", "vim ".repeat(16000) + "x"]) {
      expect(grammar.firstLineRegex.test(text)).toBe(false);
      expect(lumine.grammars.selectGrammar("modeline", text).scopeName).not.toBe("source.perl");
    }
  });
});
