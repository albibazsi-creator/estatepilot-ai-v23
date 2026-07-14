#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json"));

const required = [
  "lib/v22-american-grade.ts",
  "lib/providers/american-grade-contract.ts",
  "lib/providers/openai-live-contract.ts",
  "lib/providers/spatial-provider-contract.ts",
  "lib/providers/storage-live-contract.ts",
  "lib/providers/billing-live-contract.ts",
  "lib/providers/calendar-live-contract.ts",
  "app/dashboard/v22-american-grade/page.tsx",
  "app/dashboard/production-build-gate/page.tsx",
  "app/dashboard/ai-sla/page.tsx",
  "app/dashboard/spatial-provider-acceptance/page.tsx",
  "app/dashboard/premium-ux-benchmark/page.tsx",
  "app/dashboard/crm-automation-qa/page.tsx",
  "app/dashboard/provider-certification/page.tsx",
  "app/api/ops/v22-american-grade/route.ts",
  "app/api/american-grade/build-proof/route.ts",
  "app/api/american-grade/ai-sla/route.ts",
  "app/api/american-grade/spatial-acceptance/route.ts",
  "app/api/american-grade/premium-ux/route.ts",
  "app/api/american-grade/crm-qa/route.ts",
  "app/api/american-grade/provider-certification/route.ts",
  "docs/V22_RELEASE_NOTES.md",
  "docs/AMERICAN_GRADE_GATES.md",
  "docs/V22_PROVIDER_CERTIFICATION.md",
  "docs/V22_AI_SLA_AND_EVALS.md",
  "docs/V22_SPATIAL_ACCEPTANCE.md",
  "docs/V22_PREMIUM_UX_BENCHMARK.md",
  "docs/V22_CRM_AUTOMATION_QA.md",
  "docs/V22_NEXT_STEPS.md"
];

const requiredScripts = ["release:v21-check", "v22:american-grade", "release:v22-check", "release:v22-full"];
const missing = required.filter((file) => !exists(file));
const missingScripts = requiredScripts.filter((script) => !pkg.scripts?.[script]);
const routes = required.filter((file) => file.startsWith("app/api/") && file.endsWith("route.ts"));
const badRoutes = routes.filter((file) => !/export\s+async\s+function\s+GET/.test(read(file)));
const pages = required.filter((file) => file.startsWith("app/dashboard/") && file.endsWith("page.tsx"));
const badPages = pages.filter((file) => !/export\s+default\s+function/.test(read(file)));
const lib = exists("lib/v22-american-grade.ts") ? read("lib/v22-american-grade.ts") : "";
const namedGates = [
  "Production build proof gate",
  "Live AI SLA",
  "3D / digital twin provider acceptance",
  "Premium UX benchmark",
  "CRM revenue automation QA",
  "Provider certification matrix"
];
const missingGateText = namedGates.filter((gate) => !lib.includes(gate));
const docsText = required.filter((file) => file.startsWith("docs/")).map((file) => exists(file) ? read(file) : "").join("\n");
const requiredConcepts = ["OpenAI", "R2", "Resend", "Gaussian", "Zillow", "Matterport", "lead", "seller report"];
const missingConcepts = requiredConcepts.filter((concept) => !docsText.toLowerCase().includes(concept.toLowerCase()));
const checksum = crypto.createHash("sha256").update(JSON.stringify({ version: pkg.version, required, requiredScripts, namedGates })).digest("hex").slice(0, 24);
const report = {
  version: pkg.version,
  check: "v22-american-grade",
  status: missing.length || missingScripts.length || badRoutes.length || badPages.length || missingGateText.length || missingConcepts.length ? "FAIL" : "PASS",
  checksum,
  requiredFiles: required.length,
  missing,
  missingScripts,
  badRoutes,
  badPages,
  missingGateText,
  missingConcepts,
  gates: namedGates,
  note: "No-dependency artifact check. Full Next.js build still requires npm install on the target machine."
};
fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports", "v22-american-grade-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exit(1);
