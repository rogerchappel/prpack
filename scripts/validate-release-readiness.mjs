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
requireField(scripts['version:smoke'], 'package.json scripts must include version:smoke');
requireField(scripts['release:check'], 'package.json scripts must include release:check');
requireField(scripts['release:availability'], 'package.json scripts must include release:availability');
requireField(scripts['release:availability:test'], 'package.json scripts must include release:availability:test');
requireField(
  typeof scripts['release:check'] === 'string' && /npm run version:smoke/.test(scripts['release:check']),
  'release:check must run the packaged CLI version smoke test',
);

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
    requireField(
      /workflow_dispatch:[\s\S]*tag:[\s\S]*required:\s*true/.test(releaseWorkflow),
      'release workflow recovery must require an explicit tag input',
    );
    requireField(
      /ref:\s*\$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.tag \|\| github\.ref \}\}/.test(releaseWorkflow),
      'release workflow recovery must check out the requested tag',
    );
    requireField(
      /tag_commit=.*rev-parse "refs\/tags\/\$REQUESTED_TAG\^\{commit\}"[\s\S]*head_commit=.*rev-parse HEAD[\s\S]*"\$tag_commit" != "\$head_commit"/.test(releaseWorkflow),
      'release workflow must reject a requested tag that does not match the checked-out ref',
    );
    requireField(
      /REQUESTED_TAG" != "v\$package_version"/.test(releaseWorkflow),
      'release workflow must reject a tag that does not match the package version',
    );
    requireField(
      /if:\s*steps\.npm\.outputs\.published != 'true'[\s\S]*npm publish --provenance --access public/.test(releaseWorkflow),
      'release workflow must not republish an existing npm package version',
    );
    requireField(
      /if:\s*github\.event_name != 'workflow_dispatch'[\s\S]*gh release create/.test(releaseWorkflow) &&
        /if:\s*github\.event_name == 'workflow_dispatch'[\s\S]*gh release view/.test(releaseWorkflow),
      'release recovery must confirm the existing GitHub release without creating a duplicate',
    );
  }
}

if (failures.length > 0) {
  console.error('Release readiness validation failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('Release readiness validation passed.');
