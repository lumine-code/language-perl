describe("Perl grammar selection", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
  });

  it("selects Tree-sitter for a Perl shebang", () => {
    const grammar = lumine.grammars.selectGrammar("run.pl", "#!/usr/bin/env perl\nprint 1;\n");

    expect(grammar.scopeName).toBe("source.perl");
    expect(grammar.type).toBe("tree-sitter");
  });

  it("does not claim a Raku/perl6 shebang", () => {
    const grammar = lumine.grammars.selectGrammar("run.p6", "#!/usr/bin/env perl6\nsay 1;\n");

    expect(grammar.scopeName).not.toBe("source.perl");
  });
});
