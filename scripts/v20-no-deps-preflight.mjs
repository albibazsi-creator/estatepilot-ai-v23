#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
const notes = [];

function exists(p) { return fs.existsSync(path.join(root, p)); }
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
function addFail(check, message, file = null) { failures.push({ check, message, file }); }
function addWarn(check, message, file = null) { warnings.push({ check, message, file }); }
function walk(dir, out = []) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return out;
  for (const name of fs.readdirSync(fullDir)) {
    if (['node_modules', '.next', '.git', 'public/uploads'].includes(name)) continue;
    const full = path.join(fullDir, name);
    const rel = path.relative(root, full).replaceAll(path.sep, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}
function resolveImport(fromFile, spec) {
  if (!(spec.startsWith('.') || spec.startsWith('@/'))) return { external: true };
  const fromDir = path.dirname(path.join(root, fromFile));
  const base = spec.startsWith('@/') ? path.join(root, spec.slice(2)) : path.resolve(fromDir, spec);
  const candidates = [
    base,
    `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.json`,
    path.join(base, 'index.ts'), path.join(base, 'index.tsx'), path.join(base, 'route.ts'), path.join(base, 'page.tsx')
  ];
  return { external: false, found: candidates.some((candidate) => fs.existsSync(candidate)), candidates: candidates.map((candidate) => path.relative(root, candidate).replaceAll(path.sep, '/')) };
}

// 1. Required project files.
for (const required of ['package.json', 'tsconfig.json', 'next.config.ts', 'app/layout.tsx', 'app/page.tsx', 'prisma/schema.prisma', 'prisma/seed.ts', 'README.md']) {
  if (!exists(required)) addFail('required-file', `Missing required file: ${required}`, required);
}

// 2. package.json validity and script target existence.
let pkg = null;
try {
  pkg = JSON.parse(read('package.json'));
  if (!pkg.scripts?.dev || !pkg.scripts?.build) addFail('package-scripts', 'package.json must include dev and build scripts', 'package.json');
  for (const [name, command] of Object.entries(pkg.scripts || {})) {
    const tsxMatches = [...command.matchAll(/tsx\s+([^\s&|]+)/g)].map((m) => m[1]);
    for (const scriptFile of tsxMatches) if (!exists(scriptFile)) addFail('script-target', `Script '${name}' references missing file ${scriptFile}`, 'package.json');
    const nodeMatches = [...command.matchAll(/node\s+([^\s&|]+)/g)].map((m) => m[1]);
    for (const scriptFile of nodeMatches) if (scriptFile.endsWith('.mjs') && !exists(scriptFile)) addFail('script-target', `Script '${name}' references missing file ${scriptFile}`, 'package.json');
  }
} catch (error) {
  addFail('package-json', `Invalid package.json: ${error.message}`, 'package.json');
}

// 3. App router structural checks.
const routeFiles = walk('app').filter((f) => f.endsWith('/route.ts'));
const pageFiles = walk('app').filter((f) => f.endsWith('/page.tsx'));
for (const file of routeFiles) {
  const text = read(file);
  const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].filter((m) => text.includes(`export async function ${m}`) || text.includes(`export function ${m}`));
  if (methods.length === 0) addFail('route-method', 'Route has no exported HTTP method', file);
  if (/export\s+default\s+/.test(text)) addWarn('route-default-export', 'Next route files should normally use named HTTP method exports, not default export', file);
}
for (const file of pageFiles) {
  const text = read(file);
  if (!/export\s+default\s+(async\s+)?function|export\s+default\s+[A-Za-z0-9_]+/.test(text)) addFail('page-default-export', 'Page file has no default export', file);
}

// 4. Import target checks for local imports.
const codeFiles = walk('.').filter((f) => /\.(ts|tsx|mjs|js)$/.test(f) && !f.startsWith('node_modules/') && !f.startsWith('.next/'));
const importRegexes = [
  /import\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
  /export\s+(?:type\s+)?[^'";]+?\s+from\s+['"]([^'"]+)['"]/g,
  /import\(['"]([^'"]+)['"]\)/g
];
for (const file of codeFiles) {
  const text = stripComments(read(file));
  for (const regex of importRegexes) {
    for (const match of text.matchAll(regex)) {
      const spec = match[1];
      const resolved = resolveImport(file, spec);
      if (!resolved.external && !resolved.found) addFail('missing-import', `Cannot resolve local import '${spec}'`, file);
    }
  }
}

// 5. Prisma lightweight schema checks.
try {
  const schema = read('prisma/schema.prisma');
  const stack = [];
  for (let i = 0; i < schema.length; i++) {
    if (schema[i] === '{') stack.push(i);
    if (schema[i] === '}') {
      if (!stack.length) addFail('prisma-braces', 'Prisma schema has an unmatched closing brace', 'prisma/schema.prisma');
      else stack.pop();
    }
  }
  if (stack.length) addFail('prisma-braces', 'Prisma schema has unmatched opening braces', 'prisma/schema.prisma');
  const names = [];
  for (const match of schema.matchAll(/^\s*(model|enum)\s+(\w+)\s*{/gm)) names.push(`${match[1]}:${match[2]}`);
  const seen = new Set();
  for (const item of names) {
    if (seen.has(item)) addFail('prisma-duplicate', `Duplicate Prisma ${item}`, 'prisma/schema.prisma');
    seen.add(item);
  }
  notes.push({ check: 'prisma-model-count', value: names.filter((n) => n.startsWith('model:')).length });
} catch (error) {
  addFail('prisma-schema', `Could not inspect Prisma schema: ${error.message}`, 'prisma/schema.prisma');
}

// 6. Critical docs and environment samples.
for (const requiredDoc of ['docs/V19_RELEASE_NOTES.md', 'docs/SPATIAL_PRODUCTION_ORCHESTRATION.md', 'docs/TENANT_SAFE_VIEWER_SHARING.md']) {
  if (!exists(requiredDoc)) addWarn('doc-coverage', `Expected continuity doc is missing: ${requiredDoc}`, requiredDoc);
}
if (!exists('.env.example')) addFail('env-example', '.env.example is missing', '.env.example');
if (!exists('.env.production.example')) addWarn('env-production-example', '.env.production.example is missing; production deploy will be less clear', '.env.production.example');

// 7. Unsafe obvious placeholders in committed env examples.
for (const file of walk('.').filter((f) => /(^|\/)\.env|\.env\./.test(f))) {
  const text = read(file);
  if (/sk-live-[A-Za-z0-9]/.test(text) || /sk-[A-Za-z0-9_-]{25,}/.test(text)) addFail('secret-scan', 'Possible live secret committed', file);
}

const summary = {
  ok: failures.length === 0,
  version: pkg?.version ?? 'unknown',
  files: walk('.').length,
  routeFiles: routeFiles.length,
  pageFiles: pageFiles.length,
  codeFiles: codeFiles.length,
  failures,
  warnings,
  notes
};
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'v20-no-deps-preflight.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
