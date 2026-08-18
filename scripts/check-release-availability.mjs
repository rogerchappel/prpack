import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

export async function checkReleaseAvailability({
  version = packageJson.version,
  fetchImpl = fetch,
  githubApi = process.env.PRPACK_GITHUB_API ?? 'https://api.github.com',
  npmRegistry = process.env.PRPACK_NPM_REGISTRY ?? 'https://registry.npmjs.org',
} = {}) {
  const tag = `v${version}`;
  const githubUrl = `${githubApi}/repos/rogerchappel/prpack/releases/tags/${tag}`;
  const npmUrl = `${npmRegistry}/prpack/${version}`;
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'prpack-release-check' };
  const [github, npm] = await Promise.all([
    fetchImpl(githubUrl, { headers }),
    fetchImpl(npmUrl, { headers: { accept: 'application/json' } }),
  ]);

  return {
    version,
    githubRelease: github.ok,
    npmPackage: npm.ok,
    githubStatus: github.status,
    npmStatus: npm.status,
  };
}

async function main() {
  const versionIndex = process.argv.indexOf('--version');
  const version = versionIndex === -1 ? packageJson.version : process.argv[versionIndex + 1];
  if (!version || (versionIndex !== -1 && version.startsWith('--'))) {
    throw new Error('Usage: node scripts/check-release-availability.mjs [--version <version>]');
  }

  const result = await checkReleaseAvailability({ version });
  console.log(`GitHub release v${result.version}: ${result.githubRelease ? 'available' : `missing (HTTP ${result.githubStatus})`}`);
  console.log(`npm package prpack@${result.version}: ${result.npmPackage ? 'available' : `missing (HTTP ${result.npmStatus})`}`);
  if (!result.githubRelease) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
