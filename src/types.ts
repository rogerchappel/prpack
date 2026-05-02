export interface GitFileChange {
  path: string;
  status: string;
}

export interface GitMetadata {
  branch: string;
  baseBranch?: string;
  headSha?: string;
  baseSha?: string;
  mergeBase?: string;
  remoteUrl?: string;
  commits: string[];
  changedFiles: GitFileChange[];
  diffStat?: string;
  isGitRepository: boolean;
}

export interface BranchBriefArtifact {
  title?: string;
  summary?: string;
  motivation?: string;
  changes?: string[];
  testing?: string[];
  risks?: string[];
  rollout?: string[];
  followUps?: string[];
  reviewers?: string[];
  raw?: unknown;
  sourcePath?: string;
}

export interface QualityGateArtifact {
  status?: "pass" | "fail" | "warn" | "unknown";
  checks?: QualityCheck[];
  summary?: string;
  commands?: string[];
  raw?: unknown;
  sourcePath?: string;
}

export interface QualityCheck {
  name: string;
  status: "pass" | "fail" | "warn" | "skip" | "unknown";
  details?: string;
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
  branchBrief?: BranchBriefArtifact;
  qualityGate?: QualityGateArtifact;
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
  prBodyPath?: string;
  baseBranch?: string;
  now?: Date;
  write?: boolean;
  json?: boolean;
  artifactPaths?: string[];
}

export interface GenerateResult {
  pack: PrPack;
  outputPath?: string;
  prBodyPath?: string;
}
