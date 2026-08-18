import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkReleaseAvailability } from './check-release-availability.mjs';

test('reports a GitHub artifact independently from a missing npm version', async () => {
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(url);
    return { ok: url.includes('/releases/tags/v0.1.0'), status: url.includes('/releases/') ? 200 : 404 };
  };

  const result = await checkReleaseAvailability({
    version: '0.1.0',
    fetchImpl,
    githubApi: 'https://github.test',
    npmRegistry: 'https://npm.test',
  });

  assert.deepEqual(result, {
    version: '0.1.0',
    githubRelease: true,
    npmPackage: false,
    githubStatus: 200,
    npmStatus: 404,
  });
  assert.deepEqual(requested, [
    'https://github.test/repos/rogerchappel/prpack/releases/tags/v0.1.0',
    'https://npm.test/prpack/0.1.0',
  ]);
});

test('reports npm availability without conflating it with GitHub', async () => {
  const result = await checkReleaseAvailability({
    version: '0.1.0',
    fetchImpl: async (url) => ({ ok: url.includes('npm.test'), status: url.includes('npm.test') ? 200 : 404 }),
    githubApi: 'https://github.test',
    npmRegistry: 'https://npm.test',
  });

  assert.equal(result.githubRelease, false);
  assert.equal(result.npmPackage, true);
});
