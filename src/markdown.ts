import type { PrPack, QualityGateArtifact, ReviewerChecklistItem } from "./types.js";

function list(items: string[], fallback: string): string {
  if (items.length === 0) return `- ${fallback}`;
  return items.map((item) => `- ${item}`).join("\n");
}

function checkbox(items: ReviewerChecklistItem[]): string {
  return items.map((item) => `- [${item.checked ? "x" : " "}] ${item.label}`).join("\n");
}

function quality(gate: QualityGateArtifact | undefined): string {
  if (!gate) return "No qualitygate artifact found. Review the Testing section and run the project checks locally.";
  const status = gate.status ?? "unknown";
  const lines = [`Status: **${status}**`];
  if (gate.summary) lines.push("", gate.summary);
  if (gate.commands?.length) lines.push("", "Commands:", ...gate.commands.map((command) => `- \`${command}\``));
  if (gate.checks?.length) {
    lines.push("", "Checks:");
    for (const check of gate.checks) {
      lines.push(`- **${check.status}** ${check.name}${check.details ? ` — ${check.details}` : ""}`);
    }
  }
  return lines.join("\n");
}

export function renderPrBody(pack: Omit<PrPack, "markdown" | "prBody">): string {
  return [
    `## Summary`,
    pack.summary,
    "",
    "## Changes",
    list(pack.sections.changes, "Review git metadata; no branchbrief changes were provided."),
    "",
    "## Testing",
    list(pack.sections.testing, "No explicit test evidence was provided."),
    "",
    "## Risks / Rollback",
    list(pack.sections.risks, "No specific risks were identified."),
    list(pack.sections.rollout, "Rollback by reverting the PR if needed."),
    "",
    "## Reviewer Checklist",
    checkbox(pack.reviewerChecklist),
  ].join("\n");
}

export function renderMarkdown(pack: Omit<PrPack, "markdown" | "prBody">, prBody: string): string {
  const git = pack.git;
  return [
    `# ${pack.title}`,
    "",
    `Generated: ${pack.metadata.generatedAt}`,
    `Working directory: \`${pack.metadata.cwd}\``,
    `Artifacts: ${pack.metadata.artifactSources.length ? pack.metadata.artifactSources.map((item) => `\`${item}\``).join(", ") : "none"}`,
    "",
    "## Git Context",
    `- Branch: \`${git.branch}\``,
    `- Base: \`${git.baseBranch ?? "unknown"}\``,
    `- HEAD: \`${git.headSha ?? "unknown"}\``,
    `- Repository: ${git.isGitRepository ? "detected" : "not detected"}`,
    "",
    "### Commits",
    list(git.commits, "No commits detected for the selected range."),
    "",
    "### Changed Files",
    git.changedFiles.length ? git.changedFiles.map((file) => `- ${file.status} ${file.path}`).join("\n") : "- No changed files detected.",
    "",
    "### Diff Stat",
    git.diffStat ? `\`\`\`\n${git.diffStat}\n\`\`\`` : "No diff stat available.",
    "",
    "## Quality Gate",
    quality(pack.qualityGate),
    "",
    "## PR Body",
    "",
    prBody,
    "",
    "## Follow-ups",
    list(pack.sections.followUps, "No follow-ups captured."),
    pack.metadata.warnings.length ? ["", "## Warnings", list(pack.metadata.warnings, "")].join("\n") : "",
  ].filter((part) => part !== "").join("\n");
}
