#!/usr/bin/env node
import { pathToFileURL } from "node:url";
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
  const seen = new Set<string>();
  const markSingleton = (option: string): void => {
    if (seen.has(option)) throw new Error(`Usage error: duplicate option ${option}`);
    seen.add(option);
  };
  const takeValue = (option: string): string => {
    const value = args.shift();
    if (!value || value.startsWith("-")) throw new Error(`Usage error: ${option} requires a value`);
    return value;
  };
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
    if (arg === "--cwd") {
      markSingleton(arg);
      options.cwd = takeValue(arg);
    } else if (arg === "--output") {
      markSingleton(arg);
      options.output = takeValue(arg);
    } else if (arg === "--pr-body") {
      markSingleton(arg);
      options.prBody = takeValue(arg);
    } else if (arg === "--base") {
      markSingleton(arg);
      options.base = takeValue(arg);
    }
    else if (arg === "--artifact") {
      options.artifacts.push(takeValue(arg));
    } else if (arg === "--json") {
      markSingleton(arg);
      options.json = true;
    } else if (arg === "--no-write") {
      markSingleton(arg);
      options.noWrite = true;
    } else if (arg === "--help" || arg === "-h") {
      markSingleton("--help");
      options.help = true;
    } else if (arg === "--version" || arg === "-v") {
      markSingleton("--version");
      options.version = true;
    } else if (arg.startsWith("-")) throw new Error(`Usage error: unknown option ${arg}`);
    else throw new Error(`Usage error: unexpected positional argument ${arg}`);
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
  if (options.command !== "generate") throw new Error(`Usage error: unknown command ${options.command}`);

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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
