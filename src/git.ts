import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { GitFileChange, GitMetadata } from "./types.js";

const execFileAsync = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd, windowsHide: true, maxBuffer: 1024 * 1024 * 10 });
    return stdout.trimEnd();
  } catch {
    return undefined;
  }
}

export function parseNameStatus(text: string | undefined): GitFileChange[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [status = "?", ...rest] = line.split(/\t+/);
      return { status, path: rest.join(" -> ") || line };
    });
}

async function resolveBaseRef(cwd: string, requestedBase: string): Promise<string | undefined> {
  const candidates = requestedBase.startsWith("origin/")
    ? [requestedBase]
    : requestedBase.startsWith("refs/")
      ? [requestedBase]
      : [`origin/${requestedBase}`, requestedBase];

  for (const candidate of candidates) {
    const resolved = await git(cwd, ["rev-parse", "--verify", "--quiet", `${candidate}^{commit}`]);
    if (resolved) return candidate;
  }
  return undefined;
}

function displayBase(ref: string): string {
  return ref.replace(/^refs\/remotes\/origin\//, "").replace(/^refs\/heads\//, "").replace(/^origin\//, "");
}

export async function readGitMetadata(cwd: string, baseBranch?: string): Promise<GitMetadata> {
  const inside = (await git(cwd, ["rev-parse", "--is-inside-work-tree"])) === "true";
  if (!inside) {
    return { branch: "unknown", baseBranch, commits: [], changedFiles: [], isGitRepository: false };
  }

  const branch = (await git(cwd, ["branch", "--show-current"])) || "detached";
  const headSha = await git(cwd, ["rev-parse", "--short", "HEAD"]);
  const remoteUrl = await git(cwd, ["config", "--get", "remote.origin.url"]);
  const guessedBase = baseBranch ?? (await git(cwd, ["symbolic-ref", "refs/remotes/origin/HEAD", "--short"]));
  const baseRef = guessedBase ? await resolveBaseRef(cwd, guessedBase) : undefined;
  if (baseBranch && !baseRef) {
    throw new Error(`Unable to resolve base branch "${baseBranch}". Fetch it or pass an existing local branch or origin/<branch> ref.`);
  }
  const normalizedBase = baseRef ? displayBase(baseRef) : guessedBase?.replace(/^origin\//, "");
  const mergeBase = baseRef ? await git(cwd, ["merge-base", "HEAD", baseRef]) : undefined;
  const diffRange = mergeBase ? `${mergeBase}..HEAD` : "HEAD";
  const baseSha = mergeBase?.slice(0, 7);
  const commitsText = await git(cwd, ["log", "--format=%s", diffRange]);
  const comparisonRef = mergeBase ?? (await git(cwd, ["rev-parse", "HEAD^"]));
  const changedText = comparisonRef
    ? await git(cwd, ["diff", "--name-status", comparisonRef, "HEAD"])
    : await git(cwd, ["diff-tree", "--root", "--no-commit-id", "--name-status", "-r", "HEAD"]);
  const diffStat = comparisonRef
    ? await git(cwd, ["diff", "--stat", comparisonRef, "HEAD"])
    : await git(cwd, ["diff-tree", "--root", "--no-commit-id", "--stat", "-r", "HEAD"]);

  return {
    branch,
    baseBranch: normalizedBase,
    headSha,
    baseSha,
    mergeBase,
    remoteUrl,
    commits: commitsText ? commitsText.split(/\r?\n/).filter(Boolean) : [],
    changedFiles: parseNameStatus(changedText),
    diffStat,
    isGitRepository: true,
  };
}
