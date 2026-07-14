#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function readJson(file) {
  const full = path.join(root, file);
  return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, 'utf8')) : null;
}
const preflight = readJson('reports/v20-no-deps-preflight.json');
const scenario = readJson('reports/v20-scenario-test.json');
const audit = readJson('reports/v20-artifact-audit.json');
const ok = Boolean(preflight?.ok && scenario?.ok && audit?.ok);
const lines = [
  '# V20 Test Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Verdict: ${ok ? 'PASS for no-dependency artifact QA' : 'BLOCKED'}`,
  '',
  '## What was actually checked in this environment',
  '',
  '- package.json parsing and script target existence',
  '- Next app route/page structural presence',
  '- local import target resolution',
  '- lightweight Prisma schema shape checks',
  '- critical pilot scenario file coverage',
  '- V20 docs and artifact checksum generation',
  '',
  '## Results',
  '',
  `- Preflight: ${preflight?.ok ? 'PASS' : 'FAIL'}`,
  `- Scenario pack: ${scenario?.ok ? 'PASS' : 'FAIL'}`,
  `- Artifact audit: ${audit?.ok ? 'PASS' : 'FAIL'}`,
  `- File count: ${audit?.fileCount ?? 'unknown'}`,
  `- Artifact checksum: ${audit?.checksum ?? 'unknown'}`,
  '',
  '## Not proven here',
  '',
  'The dependency install and Next.js production build still have to be run on a machine with successful npm install. The no-dependency QA is intentionally designed to catch artifact-level blockers before that step.',
  '',
  '## Next command sequence',
  '',
  '```bash',
  'npm run release:v20-check',
  'npm install',
  'npm run db:push',
  'npm run db:seed',
  'npm run typecheck',
  'npm run build',
  'npm run dev',
  '```',
  ''
];
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'V20_TEST_REPORT.md'), lines.join('\n'));
fs.writeFileSync(path.join(root, 'docs', 'V20_ACCEPTANCE_REPORT.md'), lines.join('\n'));
console.log(JSON.stringify({ ok, report: 'reports/V20_TEST_REPORT.md', docsReport: 'docs/V20_ACCEPTANCE_REPORT.md' }, null, 2));
if (!ok) process.exit(1);
