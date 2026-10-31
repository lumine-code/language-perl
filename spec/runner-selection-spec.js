describe("perl interpreter selection", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-perl");
  });
  it("selects real direct and env interpreters", () => {
    for (const runner of ["perl", "perl.exe"]) {
      for (const source of [
        "#!/usr/bin/" + runner,
        "#!/usr/bin/env " + runner,
        "#!/usr/bin/env.exe -S " + runner + " --version",
        "#!C:\\bin\\" + runner,
      ]) {
        expect(lumine.grammars.selectGrammar("extensionless", source).scopeName)
          .withContext(source)
          .toBe("source.perl");
      }
    }
  });
  it("rejects runner names appearing only in wrappers or arguments", () => {
    const runner = "perl";
    for (const source of [
      "#!/usr/bin/" + runner + "-wrapper",
      "#!/usr/bin/env " + runner + "-wrapper",
      "#!/bin/sh -c 'echo " + runner + "'",
      "#!/usr/bin/env printf " + runner,
      "#!/usr/bin/other /tmp/" + runner,
    ]) {
      expect(lumine.grammars.selectGrammar("extensionless", source).scopeName)
        .withContext(source)
        .not.toBe("source.perl");
    }
  });
  it("honors an explicit user file association", () => {
    try {
      lumine.config.set("core.customFileTypes", { "source.perl": ["custom-recheck"] });
      expect(
        lumine.grammars.selectGrammar("script.custom-recheck", "#!/usr/bin/other").scopeName,
      ).toBe("source.perl");
    } finally {
      lumine.config.unset("core.customFileTypes");
    }
  });
});
