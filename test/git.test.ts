import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseNameStatus } from "../src/git.js";

void describe("git helpers", () => {
  void it("parses git name-status output", () => {
    assert.deepEqual(parseNameStatus("M\tsrc/index.ts\nA\tREADME.md"), [
      { status: "M", path: "src/index.ts" },
      { status: "A", path: "README.md" },
    ]);
  });

  void it("handles empty name-status output", () => {
    assert.deepEqual(parseNameStatus(undefined), []);
  });
});
