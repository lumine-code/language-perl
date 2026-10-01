const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

const HIGHLIGHTS_PATH = path.join(__dirname, "..", "grammars", "perl-highlights.scm");

describe("Perl Tree-sitter grammar", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
  });

  afterEach(() => editor?.destroy());

  async function openPerl(text) {
    editor = await lumine.workspace.open("classes.pl");
    editor.setText(text);
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
    await editor.getBuffer().languageMode.ready;
    expect(editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent).hasError).toBe(
      false,
    );
  }

  function scopesFor(row, word) {
    const column = editor.lineTextForBufferRow(row).indexOf(word);
    expect(column).toBeGreaterThanOrEqual(0);
    return editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray();
  }

  it("highlights native classes, fields and methods", async () => {
    await openPerl("class Foo {\n  field $bar;\n  method baz { return $bar; }\n}\n");

    expect(scopesFor(0, "class")).toContain("keyword.control.import.perl");
    expect(scopesFor(0, "Foo")).toContain("support.type.perl");
    expect(scopesFor(1, "field")).toContain("keyword.control.perl");
    expect(scopesFor(2, "method")).toContain("storage.type.function.perl");
    expect(scopesFor(2, "baz")).toContain("entity.name.function.method.perl");
  });

  it("highlights Moo and Moose attribute declarations", async () => {
    await openPerl(
      'package Foo;\nuse Moo;\nhas bar => (is => "ro");\nhas "baz" => (is => "rw");\nhas qw(one two) => (is => "ro");\n',
    );

    for (const row of [2, 3, 4]) {
      expect(scopesFor(row, "has")).toContain("storage.modifier.perl");
      expect(scopesFor(row, "has")).not.toContain("entity.name.function.perl");
    }
  });

  it("does not treat ordinary has calls, methods, hash keys or strings as declarations", async () => {
    await openPerl('has(bar);\n$obj->has("bar");\nmy %options = (has => 1);\nmy $word = "has";\n');

    for (const row of [0, 1, 2, 3]) {
      expect(scopesFor(row, "has")).not.toContain("storage.modifier.perl");
    }
    expect(scopesFor(0, "has")).toContain("entity.name.function.perl");
    expect(scopesFor(1, "has")).toContain("support.other.function.method.perl");
  });

  it("does not treat runs of line comments as folds", async () => {
    editor = await lumine.workspace.open("comments.pl");
    editor.setText("# one\n# two\n# three\nmy $value = 1;\n");
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
    await editor.getBuffer().languageMode.ready;

    expect(editor.getBuffer().languageMode.getFoldableRanges()).toEqual([]);
  });

  it("keeps autoquoted hash values local inside a 6000-pair list", async () => {
    const querySource = fs.readFileSync(HIGHLIGHTS_PATH, "utf8");
    expect(querySource).not.toMatch(/\(_\s+\(autoquoted_bareword\)\s+\(bareword\)/);
    expect(querySource).toContain('(#is? test.typeAt "previousNamedSibling autoquoted_bareword")');
    expect(querySource).not.toMatch(/\(_\s+(?:operator:|modifiers:|\[\s*array:)/);
    expect(querySource).toContain("(#is? test.field operator)");
    expect(querySource).toContain("(#is? test.field modifiers)");
    expect(querySource).toContain("(#is? test.field array)");
    expect(querySource).toContain("(#is? test.field hash)");

    editor = await lumine.workspace.open("hash-locality.pl");
    const lines = ["my %hash = ("];
    for (let index = 0; index < 6000; index++) {
      lines.push(`  key_${index} => value_${index},`);
    }
    lines.push(");");
    editor.setText(lines.join("\r\n"));
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
    const languageMode = editor.getBuffer().languageMode;
    await languageMode.ready;
    expect(editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent).hasError).toBe(
      false,
    );

    const valueColumn = editor.lineTextForBufferRow(1).indexOf("value_0");
    expect(editor.scopeDescriptorForBufferPosition([1, valueColumn]).getScopesArray()).toContain(
      "constant.other.perl",
    );
    const startRow = 2998;
    const endRow = startRow + 6;
    const capturesQuery = await editor.getGrammar().getQuery("highlightsQuery");
    const queryRoot = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    const captures = capturesQuery.captures(queryRoot, {
      startPosition: new Point(startRow, 0),
      endPosition: new Point(endRow, 0),
    });
    expect(captures.length).toBeLessThanOrEqual(128);
    expect(
      captures
        .filter(({ name }) => name === "constant.other.perl")
        .every(({ node }) => node.startPosition.row >= startRow && node.startPosition.row < endRow),
    ).toBe(true);
  });
});
