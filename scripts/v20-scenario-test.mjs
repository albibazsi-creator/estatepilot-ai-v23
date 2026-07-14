#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  { scenario: 'agent_listing', files: ['app/dashboard/listings/new/page.tsx', 'app/api/listings/route.ts', 'app/api/listings/[id]/media/upload/route.ts'] },
  { scenario: 'ai_generation', files: ['app/api/listings/[id]/ai/generate-description/route.ts', 'app/api/listings/[id]/ai/generate-social-posts/route.ts', 'app/api/listings/[id]/ai/generate-faq/route.ts'] },
  { scenario: 'public_lead', files: ['app/listing/[slug]/page.tsx', 'app/api/public/listings/[slug]/lead/route.ts', 'lib/lead-scoring.ts'] },
  { scenario: 'seller_report', files: ['app/api/listings/[id]/reports/generate/route.ts', 'app/api/reports/[id]/pdf/route.ts', 'app/seller/[token]/page.tsx'] },
  { scenario: '3d_production', files: ['app/dashboard/3d-orchestrator/page.tsx', 'app/api/3d/orchestrator/route.ts', 'app/api/3d/review-queue/route.ts', 'workers/spatial-gpu/worker.py'] },
  { scenario: 'v20_testing', files: ['app/dashboard/v20-test-center/page.tsx', 'app/api/ops/v20-readiness/route.ts', 'scripts/v20-no-deps-preflight.mjs'] }
];
const results = required.map((item) => {
  const missing = item.files.filter((file) => !fs.existsSync(path.join(root, file)));
  return { scenario: item.scenario, ok: missing.length === 0, missing };
});
const ok = results.every((item) => item.ok);
const output = { ok, results, generatedAt: new Date().toISOString() };
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'v20-scenario-test.json'), JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
if (!ok) process.exit(1);
