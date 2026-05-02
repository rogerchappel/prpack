export interface GitFileChange {
  path: string;
  status: string;
}

export interface GitMetadata {
  branch: string;
  baseBranch?: string | undefined;
  headSha?: string | undefined;
  baseSha?: string | undefined;
  mergeBase?: string | undefined;
  remoteUrl?: string | undefined;
  commits: string[];
  changedFiles: GitFileChange[];
  diffStat?: string | undefined;
  isGitRepository: boolean;
}

export interface BranchBriefArtifact {
  title?: string | undefined;
  summary?: string | undefined;
  motivation?: string | undefined;
  changes?: string[] | undefined;
  testing?: string[] | undefined;
  risks?: string[] | undefined;
  rollout?: string[] | undefined;
  followUps?: string[] | undefined;
  reviewers?: string[] | undefined;
  raw?: unknown;
  sourcePath?: string | undefined;
}

export interface QualityGateArtifact {
  status?: "pass" | "fail" | "warn" | "unknown" | undefined;
  checks?: QualityCheck[] | undefined;
  summary?: string | undefined;
  commands?: string[] | undefined;
  raw?: unknown;
  sourcePath?: string | undefined;
}

export interface QualityCheck {
  name: string;
  status: "pass" | "fail" | "warn" | "skip" | "unknown";
  details?: string | undefined;
}

export interface ReviewerChecklistItem {
  label: string;
  checked: boolean;
  source: "default" | "risk" | "quality" | "artifact";
}

export interface PrPack {
  title: string;
  summary: string;
  metadata: {
    generatedAt: string;
    cwd: string;
    artifactSources: string[];
    warnings: string[];
  };
  git: GitMetadata;
  branchBrief?: BranchBriefArtifact | undefined;
  qualityGate?: QualityGateArtifact | undefined;
  sections: {
    changes: string[];
    testing: string[];
    risks: string[];
    rollout: string[];
    followUps: string[];
  };
  reviewerChecklist: ReviewerChecklistItem[];
  prBody: string;
  markdown: string;
}

export interface GenerateOptions {
  cwd: string;
  outputPath: string;
  prBodyPath?: string | undefined;
  baseBranch?: string | undefined;
  now?: Date | undefined;
  write?: boolean | undefined;
  json?: boolean | undefined;
  artifactPaths?: string[] | undefined;
}

export interface GenerateResult {
  pack: PrPack;
  outputPath?: string | undefined;
  prBodyPath?: string | undefined;
}
