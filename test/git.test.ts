import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { parseNameStatus, readGitMetadata } from "../src/git.js";

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

  void it("reports files and diff stats from a root commit", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "prpack-git-root-"));

    try {
      execFileSync("git", ["init", "--quiet"], { cwd });
      await writeFile(join(cwd, "README.md"), "# Root commit\n");
      execFileSync("git", ["add", "README.md"], { cwd });
      execFileSync("git", ["-c", "user.name=Test User", "-c", "user.email=test@example.com", "commit", "--quiet", "-m", "initial"], { cwd });

      const metadata = await readGitMetadata(cwd);

      assert.deepEqual(metadata.commits, ["initial"]);
      assert.deepEqual(metadata.changedFiles, [{ status: "A", path: "README.md" }]);
      assert.match(metadata.diffStat ?? "", /README\.md\s+\|\s+1 \+/);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  void it("rejects an explicitly requested base that cannot be resolved", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "prpack-git-missing-base-"));

    try {
      execFileSync("git", ["init", "--quiet"], { cwd });
      await writeFile(join(cwd, "README.md"), "# Initial\n");
      execFileSync("git", ["add", "README.md"], { cwd });
      execFileSync("git", ["-c", "user.name=Test User", "-c", "user.email=test@example.com", "commit", "--quiet", "-m", "initial"], { cwd });

      await assert.rejects(readGitMetadata(cwd, "definitely-missing"), /Unable to resolve base branch "definitely-missing"/);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  void it("compares against local and origin-prefixed base branches", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "prpack-git-valid-base-"));

    try {
      execFileSync("git", ["init", "--quiet", "--initial-branch=main"], { cwd });
      await writeFile(join(cwd, "README.md"), "# Initial\n");
      execFileSync("git", ["add", "README.md"], { cwd });
      execFileSync("git", ["-c", "user.name=Test User", "-c", "user.email=test@example.com", "commit", "--quiet", "-m", "initial"], { cwd });
      execFileSync("git", ["branch", "feature"], { cwd });
      execFileSync("git", ["update-ref", "refs/remotes/origin/main", "refs/heads/main"], { cwd });
      execFileSync("git", ["checkout", "--quiet", "feature"], { cwd });
      await writeFile(join(cwd, "feature.txt"), "feature\n");
      execFileSync("git", ["add", "feature.txt"], { cwd });
      execFileSync("git", ["-c", "user.name=Test User", "-c", "user.email=test@example.com", "commit", "--quiet", "-m", "feature"], { cwd });

      const local = await readGitMetadata(cwd, "main");
      const remote = await readGitMetadata(cwd, "origin/main");

      assert.equal(local.baseBranch, "main");
      assert.equal(remote.baseBranch, "main");
      assert.deepEqual(local.changedFiles, [{ status: "A", path: "feature.txt" }]);
      assert.deepEqual(remote.changedFiles, local.changedFiles);
      assert.equal(remote.mergeBase, local.mergeBase);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
