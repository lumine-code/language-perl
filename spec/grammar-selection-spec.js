// A first-line match is worth 0.5 to a grammar's score, and preferring
// Tree-sitter is worth only 0.1. So whenever a TextMate grammar declares
// `firstLineMatch` and its Tree-sitter twin declares no `firstLineRegex`, every
// file whose first line matches quietly gets the TextMate grammar — here, any
// script with a `perl` shebang.

describe("Perl grammar selection", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
    lumine.config.set("editor.useTreeSitterParsers", true);
  });

  it("prefers the Tree-sitter grammar for a script with a perl shebang", () => {
    const grammar = lumine.grammars.selectGrammar("run.pl", "#!/usr/bin/env perl\nprint 1;\n");

    expect(grammar.scopeName).toBe("source.perl");
    expect(grammar.constructor.name).toBe("TreeSitterGrammar");
  });

  it("does not claim a perl6 shebang for Perl 5", () => {
    // `\b` after `perl` is what keeps this out; `perl6` is a different
    // language with its own grammar.
    const grammar = lumine.grammars.selectGrammar("run.p6", "#!/usr/bin/env perl6\nsay 1;\n");

    expect(grammar.scopeName).toBe("source.perl6");
  });

  it("still honours the TextMate preference", () => {
    lumine.config.set("editor.useTreeSitterParsers", false);

    const grammar = lumine.grammars.selectGrammar("run.pl", "#!/usr/bin/env perl\nprint 1;\n");

    expect(grammar.scopeName).toBe("source.perl");
    expect(grammar.constructor.name).toBe("Grammar");
  });
});
