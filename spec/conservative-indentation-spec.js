describe("Conservative perl indentation", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });

  afterEach(() => editor?.destroy());

  for (const [name, source, row, columns] of [
    ["an open list", "my @values = (\n);", 0, 4],
    ["a complete expression", "my @values = (1, 2);", 0, 0],
    ["interpolation in an open list", 'my @values = ("${value}",\n);', 0, 4],
    ["a literal", 'my $value = "([{";', 0, 0],
    ["a comment", "# ([{", 0, 0],
    ["a nested body", "my @values = (\n    1\n);", 1, 4],
  ]) {
    it(`keeps the intended level after ${name}`, async () => {
      editor.setText(source);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([row, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(row + 1)).toBe(" ".repeat(columns));
      expect(editor.getCursorBufferPosition().column).toBe(columns);
    });
  }

  it("dedents a closing delimiter only when it is typed at the start of a row", async () => {
    editor.setText("my @values = (" + "\n    ");
    await editor.whenGrammarSettled();
    editor.setCursorBufferPosition([1, Infinity]);
    editor.insertText(")", { autoIndent: true, autoDecreaseIndent: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(1)).toBe(")");
  });

  it("preserves multiline literal contents during explicit reindent", async () => {
    const source = 'my $text = "first\n\tkeep this tab\n  keep these spaces";\n';
    editor.setText(source);
    await editor.whenGrammarSettled();
    editor.getBuffer().clearUndoStack();
    editor.autoIndentBufferRows(0, editor.getLastBufferRow() - 1);
    await editor.whenGrammarSettled();
    expect(editor.getText()).toBe(source);
    editor.autoIndentBufferRows(0, editor.getLastBufferRow() - 1);
    expect(editor.getText()).toBe(source);
  });
});
