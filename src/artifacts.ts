import { basename, join } from "node:path";
import { pathExists, readJsonFile } from "./fs.js";
import type { BranchBriefArtifact, QualityGateArtifact, QualityCheck } from "./types.js";

const DEFAULT_ARTIFACT_PATHS = [
  "branchbrief.json",
  ".branchbrief.json",
  "branchbrief/branchbrief.json",
  ".branchbrief/branchbrief.json",
  "qualitygate.json",
  ".qualitygate.json",
  "qualitygate/qualitygate.json",
  ".qualitygate/qualitygate.json",
];

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => (typeof item === "string" ? item.trim() : undefined)).filter((item): item is string => Boolean(item));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function normalizeBranchBrief(raw: unknown, sourcePath?: string): BranchBriefArtifact {
  const record = asRecord(raw);
  return {
    title: asString(record.title),
    summary: asString(record.summary ?? record.description),
    motivation: asString(record.motivation ?? record.why),
    changes: asStringArray(record.changes ?? record.changed),
    testing: asStringArray(record.testing ?? record.tests),
    risks: asStringArray(record.risks ?? record.risk),
    rollout: asStringArray(record.rollout ?? record.rollback),
    followUps: asStringArray(record.followUps ?? record.follow_ups ?? record.todo),
    reviewers: asStringArray(record.reviewers),
    raw,
    sourcePath,
  };
}

function normalizeStatus(value: unknown): QualityCheck["status"] {
  const text = typeof value === "string" ? value.toLowerCase() : "unknown";
  if (["pass", "fail", "warn", "skip"].includes(text)) return text as QualityCheck["status"];
  return "unknown";
}

function normalizeChecks(value: unknown): QualityCheck[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item, index) => {
    const record = asRecord(item);
    return {
      name: asString(record.name ?? record.label) ?? `check-${index + 1}`,
      status: normalizeStatus(record.status ?? record.result),
      details: asString(record.details ?? record.output ?? record.message),
    };
  });
}

export function normalizeQualityGate(raw: unknown, sourcePath?: string): QualityGateArtifact {
  const record = asRecord(raw);
  const status = normalizeStatus(record.status ?? record.result);
  return {
    status: status === "skip" ? "unknown" : status,
    checks: normalizeChecks(record.checks),
    summary: asString(record.summary),
    commands: asStringArray(record.commands),
    raw,
    sourcePath,
  };
}

export async function discoverArtifacts(cwd: string, extraPaths: string[] = []): Promise<{ branchBrief?: BranchBriefArtifact | undefined; qualityGate?: QualityGateArtifact | undefined; sources: string[]; warnings: string[] }> {
  const paths = [...extraPaths, ...DEFAULT_ARTIFACT_PATHS];
  const sources: string[] = [];
  const warnings: string[] = [];
  let branchBrief: BranchBriefArtifact | undefined;
  let qualityGate: QualityGateArtifact | undefined;

  for (const relative of paths) {
    const fullPath = join(cwd, relative);
    if (!(await pathExists(fullPath))) continue;
    try {
      const raw = await readJsonFile(fullPath);
      const fileName = basename(relative).toLowerCase();
      if (!branchBrief && fileName.includes("branchbrief")) {
        branchBrief = normalizeBranchBrief(raw, relative);
        sources.push(relative);
      } else if (!qualityGate && fileName.includes("qualitygate")) {
        qualityGate = normalizeQualityGate(raw, relative);
        sources.push(relative);
      }
    } catch (error) {
      warnings.push(`Could not read ${relative}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { branchBrief, qualityGate, sources, warnings };
}
