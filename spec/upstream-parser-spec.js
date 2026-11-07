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

  it("parses interpolated subscripts when their opener is also the quote delimiter", async () => {
    editor.setText("qq{$h{a}};\nqq[$a[0]];\nqq{@h{a}};\nqq{$h{$k}{x} {y}};\n");
    expect(await editor.whenGrammarSettled()).toBe(true);
    const root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("hash_element_expression").map((node) => node.text)).toEqual([
      "$h{a}",
      "$h{$k}{x}",
      "$h{$k}",
    ]);
    expect(root.descendantsOfType("array_element_expression")[0].text).toBe("$a[0]");
    expect(root.descendantsOfType("slice_expression")[0].text).toBe("@h{a}");
    editor.getBuffer().append("my $tail = 2;\n");
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent).hasError).toBe(
      false,
    );
  });

  it("leaves literal and whitespace-separated quote brackets as string content", async () => {
    editor.setText('qq{[{"a":1}]};\nqq{\\n{x}};\nqq{$a {x}};\n');
    expect(await editor.whenGrammarSettled()).toBe(true);
    const root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("hash_element_expression")).toEqual([]);
    expect(root.descendantsOfType("array_element_expression")).toEqual([]);
    expect(root.descendantsOfType("scalar").map((node) => node.text)).toEqual(["$a"]);
  });

  it("scopes only prototype parentheses, including an empty prototype", async () => {
    editor.setText("sub empty ();\nsub filled ($$);\n");
    expect(await editor.whenGrammarSettled()).toBe(true);
    const scopes = (row, column) =>
      editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray();
    for (const row of [0, 1]) {
      expect(scopes(row, 10 + row)).toContain(
        "punctuation.definition.expression.begin.bracket.round.perl",
      );
      expect(scopes(row, row === 0 ? 11 : 14)).toContain(
        "punctuation.definition.expression.end.bracket.round.perl",
      );
    }
    expect(scopes(1, 12)).not.toContain(
      "punctuation.definition.expression.begin.bracket.round.perl",
    );
    expect(scopes(1, 13)).not.toContain("punctuation.definition.expression.end.bracket.round.perl");
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
    ["literal arrows after interpolation", 'my $s = "a $h{A}->B! $x->\\n";\n'],
    ["line-initial equals inside a string", 'print "\\n\n=head1 not pod\n";\n'],
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
