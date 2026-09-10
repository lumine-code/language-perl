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
    expect(languageMode.tree.rootNode.hasError).toBe(false);

    const valueColumn = editor.lineTextForBufferRow(1).indexOf("value_0");
    expect(editor.scopeDescriptorForBufferPosition([1, valueColumn]).getScopesArray()).toContain(
      "constant.other.perl",
    );
    const startRow = 2998;
    const endRow = startRow + 6;
    const layer = languageMode.rootLanguageLayer;
    const captures = layer.queries.highlightsQuery.captures(layer.tree.rootNode, {
      startPosition: new Point(startRow, 0),
      endPosition: new Point(endRow, 0),
    });
    expect(captures.length).toBeLessThanOrEqual(128);
    expect(
      captures
        .filter(({ name }) => name === "constant.other.perl")
        .every(({ node }) => node.startPosition.row >= startRow && node.startPosition.row < endRow),
    ).toBe(true);

    const nonLocalPatterns = [];
    for (let index = 0; index < layer.queries.highlightsQuery.patternCount(); index++) {
      if (layer.queries.highlightsQuery.isPatternNonLocal(index)) nonLocalPatterns.push(index);
    }
    expect(nonLocalPatterns).toEqual([]);
  });
});
