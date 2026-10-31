describe("language-perl recovered multiline payload", () => {
  let editor;
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });
  afterEach(() => editor?.destroy());

  for (const { opener, punctuation, control } of [
    { opener: "my $value = q(", punctuation: "{", control: "my $value = q(raw);\nmy @values = (" },
    {
      opener: "my $value = qq(",
      punctuation: "{",
      control: "my $value = qq(raw);\nmy @values = (",
    },
    {
      opener: "my $value = qr(",
      punctuation: "{",
      control: "my $value = qr(raw);\nmy @values = (",
    },
  ]) {
    it("keeps repeated Enter inside " + JSON.stringify(opener), async () => {
      editor.setText(opener + "\n      " + punctuation);
      await editor.whenGrammarSettled();
      for (let step = 0; step < 2; step++) {
        editor.setCursorBufferPosition([editor.getLastBufferRow(), Infinity]);
        editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
        await editor.whenGrammarSettled();
        expect(editor.lineTextForBufferRow(editor.getLastBufferRow())).toBe("      ");
        if (step === 0) {
          editor.insertText(punctuation, { autoIndent: true, autoDecreaseIndent: true });
          await editor.whenGrammarSettled();
        }
      }
    });

    it("preserves authored payload margins inside " + JSON.stringify(opener), async () => {
      const source = opener + "\n      " + punctuation + "\n      payload";
      editor.setText(source);
      await editor.whenGrammarSettled();
      for (let pass = 0; pass < 2; pass++) {
        editor.autoIndentBufferRows(0, editor.getLastBufferRow());
        await editor.whenGrammarSettled();
        expect(editor.getText()).toBe(source);
      }
    });

    it("still indents code after a complete " + JSON.stringify(opener), async () => {
      editor.setText(control);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([editor.getLastBufferRow(), Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(editor.getLastBufferRow())).toBe("    ");
    });
  }
});
