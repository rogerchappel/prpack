#!/usr/bin/env node
import { generatePrPack } from "./generate.js";

interface CliOptions {
  command?: string | undefined;
  cwd: string;
  output: string;
  prBody?: string | undefined;
  base?: string | undefined;
  json: boolean;
  noWrite: boolean;
  artifacts: string[];
  help: boolean;
  version: boolean;
}

const help = `prpack — deterministic PR handoff packs

Usage:
  prpack generate [options]

Options:
  --cwd <path>           Repository to inspect (default: current directory)
  --output <path>        Markdown pack path (default: PR_PACK.md)
  --pr-body <path>       Also write PR body text to this path
  --base <branch>        Base branch name for git comparison
  --artifact <path>      Extra artifact path to read (repeatable)
  --json                 Print JSON result for automation
  --no-write             Do not write files; print output only
  -h, --help             Show help
  -v, --version          Show version

Examples:
  prpack generate
  prpack generate --base main --pr-body PR_BODY.md
  prpack generate --json --no-write
`;

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { cwd: process.cwd(), output: "PR_PACK.md", json: false, noWrite: false, artifacts: [], help: false, version: false };
  const args = [...argv];
  options.command = args.shift();
  if (options.command === "--help" || options.command === "-h") {
    options.help = true;
    options.command = undefined;
  } else if (options.command === "--version" || options.command === "-v") {
    options.version = true;
    options.command = undefined;
  }
  while (args.length) {
    const arg = args.shift();
    if (!arg) continue;
    if (arg === "--cwd") options.cwd = args.shift() ?? options.cwd;
    else if (arg === "--output") options.output = args.shift() ?? options.output;
    else if (arg === "--pr-body") options.prBody = args.shift();
    else if (arg === "--base") options.base = args.shift();
    else if (arg === "--artifact") {
      const artifact = args.shift();
      if (artifact) options.artifacts.push(artifact);
    } else if (arg === "--json") options.json = true;
    else if (arg === "--no-write") options.noWrite = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--version" || arg === "-v") options.version = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

async function readVersion(): Promise<string> {
  return "0.1.0";
}

export async function run(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(argv);
  if (options.version) {
    console.log(await readVersion());
    return;
  }
  if (!options.command || options.help) {
    console.log(help);
    return;
  }
  if (options.command !== "generate") throw new Error(`Unknown command: ${options.command}`);

  const generateOptions = {
    cwd: options.cwd,
    outputPath: options.output,
    artifactPaths: options.artifacts,
    write: !options.noWrite,
    json: options.json,
    ...(options.prBody ? { prBodyPath: options.prBody } : {}),
    ...(options.base ? { baseBranch: options.base } : {}),
  };
  const result = await generatePrPack(generateOptions);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (options.noWrite) {
    console.log(result.pack.markdown);
  } else {
    console.log(`Wrote ${result.outputPath}`);
    if (result.prBodyPath) console.log(`Wrote ${result.prBodyPath}`);
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
