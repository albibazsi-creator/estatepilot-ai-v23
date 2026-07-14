#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const ignore = new Set(['node_modules', '.next', '.git', 'public/uploads']);
function walk(dir = '.', out = []) {
  for (const name of fs.readdirSync(path.join(root, dir))) {
    if (ignore.has(name)) continue;
    const full = path.join(root, dir, name);
    const rel = path.relative(root, full).replaceAll(path.sep, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(rel, out); else out.push(rel);
  }
  return out;
}
const files = walk();
const byExt = files.reduce((acc, file) => {
  const ext = path.extname(file) || '[none]';
  acc[ext] = (acc[ext] || 0) + 1;
  return acc;
}, {});
const hashes = files.filter((file) => /\.(ts|tsx|mjs|js|json|prisma|md|yml|yaml|example)$/.test(file)).sort().map((file) => {
  const text = fs.readFileSync(path.join(root, file));
  return `${file}:${crypto.createHash('sha256').update(text).digest('hex')}`;
});
const checksum = crypto.createHash('sha256').update(hashes.join('\n')).digest('hex');
const requiredDocs = ['docs/V20_RELEASE_NOTES.md', 'docs/V20_TESTING_RUNBOOK.md', 'docs/V20_ACCEPTANCE_REPORT.md', 'docs/V20_NEXT_STEPS.md'];
const missingDocs = requiredDocs.filter((file) => !fs.existsSync(path.join(root, file)));
const output = {
  ok: missingDocs.length === 0,
  fileCount: files.length,
  byExt,
  checksum: checksum.slice(0, 32),
  missingDocs,
  generatedAt: new Date().toISOString()
};
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'v20-artifact-audit.json'), JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
if (!output.ok) process.exit(1);
