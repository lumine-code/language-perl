describe("Literal recovery in perl", () => {
  let editor;
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });
  afterEach(() => editor?.destroy());

  async function enterAfter(source, columns) {
    editor.setText(source);
    await editor.whenGrammarSettled();
    const row = editor.getLastBufferRow();
    editor.setCursorBufferPosition([row, Infinity]);
    editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(row + 1))
      .withContext(source)
      .toBe(" ".repeat(columns));
    expect(editor.getCursorBufferPosition().column).withContext(source).toBe(columns);
  }

  for (const [source, columns] of [
    ['my $value = "{', 0],
    ["my $value = '{", 0],
    ["my $value = q{raw", 0],
    ["my $value = qq{raw", 0],
    ["my $value = qr{raw", 0],
    ["my $value = q [raw", 0],
    ["my $value = q{raw\n{", 0],
    ['if ($ready) {\n    my $value = "{', 4],
  ]) {
    it("keeps the literal margin for " + JSON.stringify(source), async () => {
      await enterAfter(source, columns);
    });
  }

  for (const source of [
    "my $values = [",
    'my $value = "text"; my $values = [',
    "my $value = q{ok}; my $values = [",
  ]) {
    it("still indents a real container in " + JSON.stringify(source), async () => {
      await enterAfter(source, 4);
    });
  }
});
