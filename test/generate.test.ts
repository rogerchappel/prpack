import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, it } from "node:test";
import { generatePrPack } from "../src/generate.js";

const temps: string[] = [];

async function fixture(name: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `prpack-${name}-`));
  temps.push(dir);
  await cp(resolve("fixtures", name), dir, { recursive: true });
  return dir;
}

void afterEach(async () => {
  while (temps.length) {
    const dir = temps.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

void describe("generatePrPack", () => {
  void it("uses branchbrief and qualitygate artifacts when present", async () => {
    const cwd = await fixture("with-artifacts");
    const result = await generatePrPack({ cwd, outputPath: "PR_PACK.md", prBodyPath: "PR_BODY.md", now: new Date("2026-01-02T03:04:05Z") });
    assert.match(result.pack.markdown, /Add deterministic PR pack generation/);
    assert.match(result.pack.markdown, /Quality Gate/);
    assert.match(result.pack.prBody, /Reviewer Checklist/);
    assert.equal(result.pack.metadata.artifactSources.length, 2);
    assert.match(await readFile(join(cwd, "PR_PACK.md"), "utf8"), /Generated: 2026-01-02T03:04:05.000Z/);
    assert.match(await readFile(join(cwd, "PR_BODY.md"), "utf8"), /## Summary/);
    const snippets = await readFile(resolve("fixtures", "expected", "with-artifacts-snippets.md"), "utf8");
    for (const snippet of snippets.split("\n\n").filter(Boolean)) {
      assert.ok(result.pack.markdown.includes(snippet.trim()), `missing snapshot snippet: ${snippet}`);
    }
  });

  void it("falls back gracefully without artifacts or git", async () => {
    const cwd = await fixture("git-only");
    const result = await generatePrPack({ cwd, outputPath: "PR_PACK.md", write: false, now: new Date("2026-01-02T03:04:05Z") });
    assert.equal(result.pack.git.isGitRepository, false);
    assert.match(result.pack.markdown, /Artifacts: none/);
    assert.match(result.pack.prBody, /Run or request missing quality checks/);
  });
});
