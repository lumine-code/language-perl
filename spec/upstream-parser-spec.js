describe("Perl parenthesized calls", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
  });

  afterEach(() => editor?.destroy());

  it("keeps a hash element as a normal call argument", async () => {
    editor.setText("foo($h{x}, 1);\nf($x), $y;\n");
    await editor.languageMode.ready;
    const root = editor.languageMode.tree.rootNode;
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("indirect_object")).toEqual([]);
    const calls = root.descendantsOfType("function_call_expression");
    expect(calls.map((node) => node.text)).toEqual(["foo($h{x}, 1)", "f($x)"]);
    expect(calls[0].childForFieldName("arguments").namedChildren[0].type).toBe(
      "hash_element_expression",
    );
  });

  for (const [name, text] of [
    ["dash-prefixed autoquoted keys", "$h{-field}; $h{-my}; $h{-q};\n"],
    ["comments in punctuation variables", "${- # why\n};\n"],
    ["quote-like equals delimiters at column zero", "my $q = q\n=x=;\nmy $after = 1;\n"],
    [
      "braced regex backreferences and character properties",
      "my $re = qr{(a)\\g{-1}\\p{L}};\nmy $after = 1;\n",
    ],
    ["escaped nested strings in interpolated code", 'my $s = "@{[ f(\\"$y\\") ]}";\n'],
  ]) {
    it(`parses ${name} and preserves scanner state through edits`, async () => {
      editor.setText(text);
      await editor.languageMode.ready;
      expect(editor.languageMode.tree.rootNode.hasError).toBe(false);
      editor.getBuffer().append("my $tail = 2;\n");
      await editor.languageMode.atTransactionEnd();
      const root = editor.languageMode.tree.rootNode;
      expect(root.hasError).toBe(false);
      expect(root.descendantsOfType("assignment_expression").at(-1).text).toBe("my $tail = 2");
    });
  }
});
