import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  encoding: 'utf8',
});
const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));
const required = [
  'dist/src/cli.js',
  'dist/src/index.js',
  'docs/artifacts.md',
  'docs/cli.md',
  'examples/branchbrief.json',
  'examples/qualitygate.json',
  'fixtures/with-artifacts/branchbrief.json',
  'fixtures/with-artifacts/qualitygate.json',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md',
];

const missing = required.filter((file) => !files.has(file));
if (missing.length > 0) {
  console.error('Package smoke failed; missing expected release-candidate files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

console.log(`Package smoke OK: ${pack.name}@${pack.version} includes ${pack.files.length} files.`);

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'prpack-package-smoke-'));
try {
  const packedOutput = execFileSync('npm', ['pack', '--json', '--pack-destination', temporaryDirectory], {
    encoding: 'utf8',
  });
  const [packed] = JSON.parse(packedOutput);
  const tarball = join(temporaryDirectory, packed.filename);
  const installPrefix = join(temporaryDirectory, 'installed');
  execFileSync('npm', ['install', '--ignore-scripts', '--prefix', installPrefix, tarball], {
    encoding: 'utf8',
  });

  const executable = join(installPrefix, 'node_modules', '.bin', 'prpack');
  const help = execFileSync(executable, ['--help'], { encoding: 'utf8' });
  if (!help.includes('prpack — deterministic PR handoff packs')) {
    throw new Error('Installed prpack --help output did not contain the documented heading.');
  }

  const version = execFileSync(executable, ['--version'], { encoding: 'utf8' }).trim();
  if (version !== pack.version) {
    throw new Error(`Installed prpack --version returned ${JSON.stringify(version)}; expected ${pack.version}.`);
  }

  const generated = execFileSync(executable, ['generate', '--cwd', process.cwd(), '--no-write'], {
    encoding: 'utf8',
  });
  if (!generated.startsWith('# ') || !generated.includes('\nGenerated: ') || !generated.includes('\n## Git Context')) {
    throw new Error('Installed prpack generate command did not emit a PR handoff pack.');
  }

  const linkedEntrypoint = readFileSync(executable, 'utf8');
  if (!linkedEntrypoint.includes('prpack')) {
    throw new Error('Installed prpack bin link did not resolve to the packaged entrypoint.');
  }

  console.log('Installed bin smoke OK: --help, --version, and generate succeeded through node_modules/.bin/prpack.');
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
