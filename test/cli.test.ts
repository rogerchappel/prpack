import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

  void it("uses an explicitly resolved base for JSON generation", async () => {
    const { stdout } = await execFileAsync(process.execPath, ["dist/src/cli.js", "generate", "--base", "main", "--json", "--no-write"]);
    const parsed = JSON.parse(stdout) as { pack: { git: { baseBranch?: string; mergeBase?: string } } };

    assert.equal(parsed.pack.git.baseBranch, "main");
    assert.match(parsed.pack.git.mergeBase ?? "", /^[0-9a-f]{40}$/);
  });

  void it("rejects an unresolved explicit base without writing output", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "prpack-cli-missing-base-"));
    const outputPath = join(cwd, "PR_PACK.md");

    try {
      await assert.rejects(
        () => execFileAsync(process.execPath, [join(process.cwd(), "dist/src/cli.js"), "generate", "--cwd", process.cwd(), "--base", "definitely-missing"], { cwd }),
        (error: Error & { code?: number; stderr?: string }) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr ?? "", /Unable to resolve base branch "definitely-missing"/);
          return true;
        },
      );
      await assert.rejects(() => access(outputPath));
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  void it("can be imported without running the CLI", async () => {
    await rm("PR_PACK.md", { force: true });
    const { stdout } = await execFileAsync(process.execPath, ["--input-type=module", "--eval", "import('./dist/src/cli.js').then((mod) => console.log(typeof mod.run))"]);

    assert.equal(stdout.trim(), "function");
    await assert.rejects(() => access("PR_PACK.md"));
  });

  const invalidInvocations = [
    { name: "a missing value", args: ["generate", "--output"] },
    { name: "an option used as a value", args: ["generate", "--output", "--json"] },
    { name: "a duplicate singleton option", args: ["generate", "--output", "one.md", "--output", "two.md"] },
    { name: "an unexpected positional argument", args: ["generate", "extra"] },
  ];

  for (const invocation of invalidInvocations) {
    void it(`rejects ${invocation.name} before writing output`, async () => {
      const cwd = await mkdtemp(join(tmpdir(), "prpack-cli-"));
      const outputPath = join(cwd, "PR_PACK.md");

      try {
        await assert.rejects(
          () => execFileAsync(process.execPath, [join(process.cwd(), "dist/src/cli.js"), ...invocation.args], { cwd }),
          (error: Error & { code?: number; stderr?: string }) => {
            assert.equal(error.code, 1);
            assert.match(error.stderr ?? "", /^Usage error: /);
            return true;
          },
        );
        await assert.rejects(() => access(outputPath));
      } finally {
        await rm(cwd, { recursive: true, force: true });
      }
    });
  }

  void it("preserves repeated artifact options", async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      "dist/src/cli.js",
      "generate",
      "--cwd",
      "fixtures/with-artifacts",
      "--artifact",
      "branchbrief.json",
      "--artifact",
      "qualitygate.json",
      "--json",
      "--no-write",
    ]);

    const parsed = JSON.parse(stdout) as { pack: { title: string; qualityGate: { commands: string[] } } };
    assert.equal(parsed.pack.title, "Add deterministic PR pack generation");
    assert.ok(parsed.pack.qualityGate.commands.includes("npm test"));
  });
});
