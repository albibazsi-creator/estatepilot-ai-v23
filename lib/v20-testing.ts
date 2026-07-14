import crypto from "crypto";
import fs from "fs";
import path from "path";

type GateStatus = "passed" | "warning" | "failed";

type Gate = {
  key: string;
  label: string;
  status: GateStatus;
  score: number;
  evidence: string;
  blocker?: boolean;
};

const ROOT = process.cwd();

function exists(relativePath: string) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function walk(relativePath = ".", out: string[] = []) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return out;
  for (const name of fs.readdirSync(absolutePath)) {
    if (["node_modules", ".next", ".git", "public/uploads"].includes(name)) continue;
    const full = path.join(absolutePath, name);
    const rel = path.relative(ROOT, full).replaceAll(path.sep, "/");
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

function sha(input: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function statusFromScore(score: number): GateStatus {
  if (score >= 88) return "passed";
  if (score >= 64) return "warning";
  return "failed";
}

function gate(key: string, label: string, score: number, evidence: string, blocker = false): Gate {
  return { key, label, score, evidence, blocker, status: statusFromScore(score) };
}

function routeMethodCount() {
  return walk("app/api").filter((file) => file.endsWith("/route.ts")).map((file) => {
    const text = read(file);
    const methods = ["GET", "POST", "PATCH", "PUT", "DELETE"].filter((method) => text.includes(`export async function ${method}`) || text.includes(`export function ${method}`));
    return { file, methods };
  });
}

function scriptTargets() {
  const pkg = JSON.parse(read("package.json"));
  const missing: string[] = [];
  for (const [name, command] of Object.entries<string>(pkg.scripts ?? {})) {
    const tsxTargets = [...command.matchAll(/tsx\s+([^\s&|]+)/g)].map((match) => match[1]);
    const nodeTargets = [...command.matchAll(/node\s+([^\s&|]+)/g)].map((match) => match[1]).filter((target) => target.endsWith(".mjs") || target.endsWith(".js"));
    for (const target of [...tsxTargets, ...nodeTargets]) {
      if (!exists(target)) missing.push(`${name} -> ${target}`);
    }
  }
  return missing;
}

function prismaShape() {
  const schema = read("prisma/schema.prisma");
  const modelNames = [...schema.matchAll(/^\s*model\s+(\w+)\s*{/gm)].map((match) => match[1]);
  const enumNames = [...schema.matchAll(/^\s*enum\s+(\w+)\s*{/gm)].map((match) => match[1]);
  const duplicates = [...modelNames, ...enumNames].filter((name, index, arr) => arr.indexOf(name) !== index);
  let balance = 0;
  for (const char of schema) {
    if (char === "{") balance += 1;
    if (char === "}") balance -= 1;
    if (balance < 0) break;
  }
  return { modelCount: modelNames.length, enumCount: enumNames.length, duplicates, balanced: balance === 0 };
}

export function getV20TestingReadiness() {
  const files = walk(".");
  const routes = routeMethodCount();
  const routesWithoutMethods = routes.filter((route) => route.methods.length === 0);
  const pages = walk("app").filter((file) => file.endsWith("/page.tsx"));
  const scriptsMissing = scriptTargets();
  const prisma = prismaShape();
  const requiredCore = [
    "app/dashboard/core-flow/page.tsx",
    "app/dashboard/v19-readiness/page.tsx",
    "app/dashboard/3d-orchestrator/page.tsx",
    "app/dashboard/3d-review/page.tsx",
    "app/api/public/listings/[slug]/lead/route.ts",
    "app/api/listings/[id]/ai/generate-description/route.ts",
    "app/api/3d/orchestrator/route.ts",
    "app/api/3d/review-queue/route.ts",
    "app/api/ops/v19-readiness/route.ts",
    "workers/spatial-gpu/worker.py",
    "docker-compose.gpu.yml"
  ];
  const missingCore = requiredCore.filter((file) => !exists(file));
  const docsRequired = [
    "docs/V19_RELEASE_NOTES.md",
    "docs/SPATIAL_PRODUCTION_ORCHESTRATION.md",
    "docs/SPATIAL_LINEAGE_AND_QA.md",
    "docs/TENANT_SAFE_VIEWER_SHARING.md"
  ];
  const missingDocs = docsRequired.filter((file) => !exists(file));
  const hasEnvExamples = exists(".env.example") && exists(".env.production.example");

  const gates: Gate[] = [
    gate("artifact_shape", "Project artifact shape", files.length >= 500 ? 96 : 70, `${files.length} repository files detected.`),
    gate("api_surface", "API surface integrity", routes.length >= 150 && routesWithoutMethods.length === 0 ? 97 : routes.length >= 120 ? 78 : 45, `${routes.length} route files, ${routesWithoutMethods.length} without exported HTTP method.`, routesWithoutMethods.length > 0),
    gate("page_surface", "Dashboard/public page coverage", pages.length >= 100 ? 96 : pages.length >= 70 ? 82 : 50, `${pages.length} app pages detected.`),
    gate("script_targets", "Package script target integrity", scriptsMissing.length === 0 ? 100 : 40, scriptsMissing.length ? `Missing script targets: ${scriptsMissing.join(", ")}` : "All referenced node/tsx script files exist.", scriptsMissing.length > 0),
    gate("prisma_shape", "Prisma schema lightweight integrity", prisma.balanced && prisma.duplicates.length === 0 && prisma.modelCount >= 120 ? 95 : 45, `${prisma.modelCount} models, ${prisma.enumCount} enums, balanced=${prisma.balanced}, duplicates=${prisma.duplicates.length}.`, !prisma.balanced || prisma.duplicates.length > 0),
    gate("core_pilot_flow", "Core pilot flow coverage", missingCore.length === 0 ? 94 : 60, missingCore.length ? `Missing core files: ${missingCore.join(", ")}` : "Core listing → AI → landing → lead → report → 3D production files present.", missingCore.length > 0),
    gate("docs_handoff", "Testing and handoff docs", missingDocs.length === 0 ? 92 : 72, missingDocs.length ? `Missing docs: ${missingDocs.join(", ")}` : "Continuity docs present."),
    gate("env_handoff", "Environment handoff", hasEnvExamples ? 90 : 55, hasEnvExamples ? "Local and production env examples present." : "Missing local or production env example.")
  ];

  const blockers = gates.filter((item) => item.blocker || item.status === "failed").map((item) => `${item.label}: ${item.evidence}`);
  const score = Math.round(gates.reduce((sum, item) => sum + item.score, 0) / gates.length);
  const status = blockers.length ? "blocked_for_live_testing" : score >= 90 ? "ready_for_local_qa" : "ready_with_warnings";

  const scenarioPack = [
    "Agent creates listing and uploads media",
    "AI generates listing description, social copy, FAQ and Reels script",
    "Public landing page captures lead with GDPR consent",
    "Lead scoring and offer/follow-up draft run",
    "Seller report generated and export route available",
    "3D capture, orchestrator, scene review and share package are present",
    "V20 no-dependency artifact QA passes before dependency install"
  ];

  return {
    version: "v20-test-ready",
    status,
    score,
    checksum: sha({ score, routes: routes.length, pages: pages.length, prisma, missingCore, scriptsMissing }).slice(0, 24),
    generatedAt: new Date().toISOString(),
    metrics: { files: files.length, routes: routes.length, pages: pages.length, prismaModels: prisma.modelCount, prismaEnums: prisma.enumCount },
    gates,
    blockers,
    scenarioPack,
    nextCommands: [
      "npm run release:v20-check",
      "npm install",
      "npm run db:push",
      "npm run db:seed",
      "npm run build",
      "npm run dev"
    ]
  };
}

export function getV20BuildPlan() {
  return {
    phases: [
      { phase: "0-no-dependency-artifact-qa", command: "npm run release:v20-check", expected: "Passes without npm install and catches missing files/routes/scripts." },
      { phase: "1-dependency-install", command: "npm install", expected: "Creates node_modules and package-lock if not already present." },
      { phase: "2-prisma", command: "npm run db:push && npm run db:seed", expected: "Database schema and demo data are created." },
      { phase: "3-type-build", command: "npm run typecheck && npm run build", expected: "TypeScript and Next production build pass." },
      { phase: "4-runtime-smoke", command: "npm run dev", expected: "Manual test through dashboard, public listing, lead submit and seller report." },
      { phase: "5-provider-switch", command: "npm run adapters:check && npm run provider:health", expected: "Mock/live provider status is explicit before pilot." }
    ],
    hardRule: "Do not call it production-ready until phase 3 and phase 4 pass on the target machine."
  };
}
