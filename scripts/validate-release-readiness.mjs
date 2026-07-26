import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const scripts = packageJson.scripts ?? {};
const failures = [];

function requireField(condition, message) {
  if (!condition) failures.push(message);
}

requireField(packageJson.repository, 'package.json must declare repository metadata');
requireField(Array.isArray(packageJson.files) && packageJson.files.length > 0, 'package.json must declare a non-empty files allowlist');
requireField(scripts['package:smoke'], 'package.json scripts must include package:smoke');
requireField(scripts['release:check'], 'package.json scripts must include release:check');

const workflowDir = path.join(root, '.github', 'workflows');
if (fs.existsSync(workflowDir)) {
  const workflowFiles = fs.readdirSync(workflowDir).filter((file) => /\.ya?ml$/.test(file));
  requireField(workflowFiles.length > 0, 'repository must include at least one workflow file');

  for (const file of workflowFiles) {
    const workflow = fs.readFileSync(path.join(workflowDir, file), 'utf8');
    requireField(!/TODO|FIXME|template becomes an app|customization TODO/i.test(workflow), '.github/workflows/' + file + ' still contains placeholder text');
  }

  const combined = workflowFiles.map((file) => fs.readFileSync(path.join(workflowDir, file), 'utf8')).join('\n');
  requireField(/release:check/.test(combined), 'CI workflows must run npm run release:check');

  const releaseWorkflowPath = path.join(workflowDir, 'release.yml');
  requireField(fs.existsSync(releaseWorkflowPath), 'repository must include .github/workflows/release.yml');
  if (fs.existsSync(releaseWorkflowPath)) {
    const releaseWorkflow = fs.readFileSync(releaseWorkflowPath, 'utf8');
    requireField(
      /npm publish --provenance --access public/.test(releaseWorkflow),
      'release workflow must publish the public package to npm with provenance',
    );
    requireField(
      /registry-url:\s*https:\/\/registry\.npmjs\.org/.test(releaseWorkflow),
      'release workflow must configure the npm registry',
    );
    requireField(
      /id-token:\s*write/.test(releaseWorkflow),
      'release workflow must grant OIDC permission for npm trusted publishing',
    );
  }
}

if (failures.length > 0) {
  console.error('Release readiness validation failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('Release readiness validation passed.');
