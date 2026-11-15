const CASES = require("./fixtures/upstream-recovery.json");

describe("Perl upstream quote recovery", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.perl"));
  });

  afterEach(() => editor?.destroy());

  const rootNode = () => editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
  const shape = (node) =>
    "(" + node.type + node.namedChildren.map((child) => " " + shape(child)).join("") + ")";

  for (const test of CASES) {
    it(test.name + " through incremental edits and undo", async () => {
      editor.setText(test.text);
      expect(await editor.whenGrammarSettled()).toBe(true);
      expect(shape(rootNode())).toBe(test.tree);
      editor.getBuffer().clearUndoStack();
      editor.getBuffer().append("my $upstream_tail = 99;\n");
      expect(await editor.whenGrammarSettled()).toBe(true);
      expect(rootNode().descendantsOfType("assignment_expression").at(-1)?.text).toBe(
        "my $upstream_tail = 99",
      );
      editor.undo();
      expect(await editor.whenGrammarSettled()).toBe(true);
      expect(editor.getText()).toBe(test.text);
      expect(shape(rootNode())).toBe(test.tree);
    });
  }
});
