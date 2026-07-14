#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json"));

const required = [
  "lib/v21-start-before-launch.ts",
  "app/dashboard/v21-start/page.tsx",
  "app/dashboard/start-hardening/page.tsx",
  "app/dashboard/live-ai/page.tsx",
  "app/dashboard/live-3d/page.tsx",
  "app/dashboard/premium-demo/page.tsx",
  "app/dashboard/live-crm/page.tsx",
  "app/dashboard/integration-launch/page.tsx",
  "app/api/ops/v21-start-readiness/route.ts",
  "app/api/start/hardening/route.ts",
  "app/api/live/ai/wiring/route.ts",
  "app/api/live/3d/provider-bridge/route.ts",
  "app/api/premium-demo/flow/route.ts",
  "app/api/live-crm/automation/route.ts",
  "app/api/integrations/launch/route.ts",
  "docs/V21_RELEASE_NOTES.md",
  "docs/START_BEFORE_LAUNCH_RUNBOOK.md",
  "docs/SIX_GAPS_CLOSURE.md",
  "docs/LIVE_PROVIDER_WIRING.md",
  "docs/V21_TEST_PLAN.md",
  "docs/V21_NEXT_STEPS.md"
];

const missing = required.filter((file) => !exists(file));
const requiredScripts = ["release:v20-check", "v21:start", "release:v21-check"];
const missingScripts = requiredScripts.filter((script) => !pkg.scripts?.[script]);

const routeFiles = required.filter((file) => file.startsWith("app/api/") && file.endsWith("route.ts"));
const badRoutes = routeFiles.filter((file) => !/export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)/.test(read(file)));
const dashboardPages = required.filter((file) => file.startsWith("app/dashboard/") && file.endsWith("page.tsx"));
const badPages = dashboardPages.filter((file) => !/export\s+default\s+function/.test(read(file)));
const checksum = crypto.createHash("sha256").update(JSON.stringify({ required, scripts: requiredScripts, version: pkg.version })).digest("hex").slice(0, 24);

const report = {
  version: pkg.version,
  check: "v21-start-before-launch",
  status: missing.length || missingScripts.length || badRoutes.length || badPages.length ? "FAIL" : "PASS",
  checksum,
  requiredFiles: required.length,
  missing,
  missingScripts,
  badRoutes,
  badPages,
  sixGaps: [
    "stable build/runtime hardening",
    "live AI provider wiring",
    "live 3D/digital twin provider bridge",
    "premium UX demo shell",
    "CRM/sales automation live loop",
    "launch integrations matrix"
  ]
};

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports", "v21-start-before-launch-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exit(1);
