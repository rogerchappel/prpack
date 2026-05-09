import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, it } from "node:test";

const execFileAsync = promisify(execFile);

void describe("cli", () => {
  void it("prints help", async () => {
    const { stdout } = await execFileAsync(process.execPath, ["dist/src/cli.js", "--help"]);
    assert.match(stdout, /prpack generate/);
  });

  void it("supports JSON no-write generation", async () => {
    const { stdout } = await execFileAsync(process.execPath, ["dist/src/cli.js", "generate", "--cwd", "fixtures/with-artifacts", "--json", "--no-write"]);
    const parsed = JSON.parse(stdout) as { pack: { title: string; prBody: string } };
    assert.equal(parsed.pack.title, "Add deterministic PR pack generation");
    assert.match(parsed.pack.prBody, /Reviewer Checklist/);
  });

  void it("can be imported without running the CLI", async () => {
    await rm("PR_PACK.md", { force: true });
    const { stdout } = await execFileAsync(process.execPath, ["--input-type=module", "--eval", "import('./dist/src/cli.js').then((mod) => console.log(typeof mod.run))"]);

    assert.equal(stdout.trim(), "function");
    await assert.rejects(() => access("PR_PACK.md"));
  });
});
