import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const fixture = mkdtempSync(join(tmpdir(), 'prpack-version-smoke-'));
const fixtureVersion = '9.8.7-version-smoke';

try {
  const packOutput = execFileSync('npm', ['pack', '--json', '--pack-destination', fixture], {
    cwd: root,
    encoding: 'utf8',
  });
  const [{ filename }] = JSON.parse(packOutput);
  execFileSync('tar', ['-xzf', join(fixture, filename), '-C', fixture]);

  const packagePath = join(fixture, 'package', 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.version = fixtureVersion;
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const reportedVersion = execFileSync(
    process.execPath,
    [join(fixture, 'package', 'dist', 'src', 'cli.js'), '--version'],
    { encoding: 'utf8' },
  ).trim();

  assert.equal(reportedVersion, fixtureVersion, 'CLI version must come from the packaged package.json');
  console.log(`Version smoke OK: packaged CLI reports ${reportedVersion}.`);
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
