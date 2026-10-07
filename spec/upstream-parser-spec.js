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
});
