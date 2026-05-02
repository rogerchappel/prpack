import { resolve } from "node:path";
import { discoverArtifacts } from "./artifacts.js";
import { writeTextFile } from "./fs.js";
import { readGitMetadata } from "./git.js";
import { renderMarkdown, renderPrBody } from "./markdown.js";
import type { GenerateOptions, GenerateResult, PrPack, ReviewerChecklistItem } from "./types.js";

function uniq(items: Array<string | undefined>): string[] {
  return [...new Set(items.map((item) => item?.trim()).filter((item): item is string => Boolean(item)))];
}

function titleFromGit(branch: string, commits: string[]): string {
  if (commits[0]) return commits[0];
  if (branch && branch !== "unknown") return branch.replace(/[\/_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return "Pull request handoff";
}

function makeChecklist(hasQualityGate: boolean, risks: string[]): ReviewerChecklistItem[] {
  return [
    { label: "Confirm the summary matches the actual diff", checked: false, source: "default" },
    { label: "Review changed files for unintended scope creep", checked: false, source: "default" },
    { label: hasQualityGate ? "Verify qualitygate evidence is acceptable" : "Run or request missing quality checks", checked: false, source: "quality" },
    { label: "Confirm rollback plan is clear enough", checked: false, source: "default" },
    ...risks.map((risk) => ({ label: `Pay extra attention to risk: ${risk}`, checked: false, source: "risk" as const })),
  ];
}

export async function generatePrPack(options: GenerateOptions): Promise<GenerateResult> {
  const cwd = resolve(options.cwd);
  const git = await readGitMetadata(cwd, options.baseBranch);
  const artifacts = await discoverArtifacts(cwd, options.artifactPaths);
  const branchBrief = artifacts.branchBrief;
  const qualityGate = artifacts.qualityGate;
  const changes = uniq([...(branchBrief?.changes ?? []), ...git.changedFiles.slice(0, 12).map((file) => `${file.status} ${file.path}`)]);
  const testing = uniq([...(branchBrief?.testing ?? []), ...(qualityGate?.commands ?? [])]);
  const risks = uniq(branchBrief?.risks ?? []);
  const rollout = uniq(branchBrief?.rollout ?? []);
  const followUps = uniq(branchBrief?.followUps ?? []);
  const summary = branchBrief?.summary ?? branchBrief?.motivation ?? `PR handoff for ${git.branch}${git.changedFiles.length ? ` with ${git.changedFiles.length} changed file(s)` : ""}.`;
  const basePack = {
    title: branchBrief?.title ?? titleFromGit(git.branch, git.commits),
    summary,
    metadata: {
      generatedAt: (options.now ?? new Date()).toISOString(),
      cwd,
      artifactSources: artifacts.sources,
      warnings: artifacts.warnings,
    },
    git,
    branchBrief,
    qualityGate,
    sections: { changes, testing, risks, rollout, followUps },
    reviewerChecklist: makeChecklist(Boolean(qualityGate), risks),
  } satisfies Omit<PrPack, "markdown" | "prBody">;

  const prBody = renderPrBody(basePack);
  const markdown = renderMarkdown(basePack, prBody);
  const pack: PrPack = { ...basePack, prBody, markdown };

  const result: GenerateResult = { pack };
  if (options.write !== false) {
    const outputPath = resolve(cwd, options.outputPath);
    await writeTextFile(outputPath, markdown);
    result.outputPath = outputPath;
    if (options.prBodyPath) {
      const prBodyPath = resolve(cwd, options.prBodyPath);
      await writeTextFile(prBodyPath, prBody);
      result.prBodyPath = prBodyPath;
    }
  }

  return result;
}
