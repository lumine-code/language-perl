describe("Perl Tree-sitter grammar", () => {
  beforeEach(async () => {
    lumine.config.set("editor.useTreeSitterParsers", true);
    await lumine.packages.activatePackage("language-perl");
  });

  it("does not treat runs of line comments as folds", async () => {
    const editor = await lumine.workspace.open("comments.pl");
    editor.setText("# one\n# two\n# three\nmy $value = 1;\n");
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
    await editor.getBuffer().languageMode.ready;

    expect(editor.getBuffer().languageMode.getFoldableRanges()).toEqual([]);
  });
});
