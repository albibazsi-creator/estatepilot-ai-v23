import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { certificationStatus, type AmericanGradeGate, type ProviderCertification } from "@/lib/providers/american-grade-contract";
import { openAiLiveContract } from "@/lib/providers/openai-live-contract";
import { spatialProviderOutputContract } from "@/lib/providers/spatial-provider-contract";
import { storageLiveContract } from "@/lib/providers/storage-live-contract";
import { billingLiveContract } from "@/lib/providers/billing-live-contract";
import { calendarLiveContract } from "@/lib/providers/calendar-live-contract";

type GateStatus = "certified" | "partial" | "blocked";
const ROOT = process.cwd();

function exists(relativePath: string) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function envPresent(keys: string[]) {
  return keys.filter((key) => Boolean(process.env[key] && String(process.env[key]).trim().length > 0));
}

function fileScore(files: string[]) {
  const missing = files.filter((file) => !exists(file));
  return { missing, score: Math.round(((files.length - missing.length) / Math.max(1, files.length)) * 100) };
}

function envScore(keys: string[]) {
  const present = envPresent(keys);
  const missing = keys.filter((key) => !present.includes(key));
  return { present, missing, score: Math.round((present.length / Math.max(1, keys.length)) * 100) };
}

function hash(input: unknown) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 24);
}

function weighted(items: Array<[number, number]>) {
  const totalWeight = items.reduce((sum, [, weight]) => sum + weight, 0);
  return Math.round(items.reduce((sum, [score, weight]) => sum + score * weight, 0) / Math.max(1, totalWeight));
}

function gate(input: Omit<AmericanGradeGate, "status">): AmericanGradeGate {
  return { ...input, status: certificationStatus(input.score) };
}

export function getProductionBuildProofGate() {
  const requiredFiles = [
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "prisma/schema.prisma",
    "Dockerfile",
    "vercel.json",
    ".env.production.example",
    ".github/workflows/ci.yml",
    ".github/workflows/release.yml",
    ".github/workflows/pilot-readiness.yml",
    "scripts/v20-no-deps-preflight.mjs",
    "scripts/v21-start-before-launch.mjs",
    "scripts/v22-american-grade-check.mjs"
  ];
  const files = fileScore(requiredFiles);
  const pkg = readJson("package.json");
  const scripts = ["release:v22-check", "release:v22-full", "typecheck", "build", "db:push", "db:seed"];
  const missingScripts = scripts.filter((script) => !pkg.scripts?.[script]);
  const scriptScore = Math.round(((scripts.length - missingScripts.length) / scripts.length) * 100);
  const score = weighted([[files.score, 55], [scriptScore, 35], [exists("reports/v21-start-before-launch-report.json") ? 100 : 70, 10]]);
  return gate({
    key: "production_build_proof",
    label: "1. Production build proof gate",
    target: "Amerikai szint: minden release csak build/typecheck/seed/smoke bizonyíték után mehet pilotba.",
    score,
    evidence: [
      `${requiredFiles.length - files.missing.length}/${requiredFiles.length} required build files present`,
      `${scripts.length - missingScripts.length}/${scripts.length} release scripts present`,
      "release:v22-full chains install, db push, seed, typecheck and build for local proof"
    ],
    blockers: [...files.missing, ...missingScripts.map((script) => `missing script:${script}`)],
    acceptanceCriteria: [
      "npm run release:v22-check PASS",
      "npm install PASS on the target machine",
      "npm run db:push && npm run db:seed PASS",
      "npm run typecheck && npm run build PASS",
      "manual public listing → lead → seller report smoke PASS"
    ]
  });
}

export function getLiveAiSlaGate() {
  const env = envScore(["OPENAI_API_KEY", "OPENAI_MODEL_TEXT", "OPENAI_MODEL_VISION"]);
  const files = fileScore([
    "lib/ai.ts",
    "lib/ai-trace.ts",
    "lib/chat-guardrails.ts",
    "lib/providers/openai-live-contract.ts",
    "app/api/listings/[id]/ai/generate-description/route.ts",
    "app/api/public/listings/[slug]/chat/route.ts",
    "app/dashboard/ai-evals/page.tsx"
  ]);
  const score = weighted([[files.score, 50], [env.score, 35], [openAiLiveContract.evalSuites.length >= 4 ? 100 : 60, 15]]);
  return gate({
    key: "live_ai_sla",
    label: "2. Live AI SLA + eval gate",
    target: "Amerikai szint: live multimodal AI, hallucination guardrail, audit trace és eval suite minden property AI funkcióhoz.",
    score,
    evidence: [
      `AI eval suites: ${openAiLiveContract.evalSuites.join(", ")}`,
      `Required trace fields: ${openAiLiveContract.requiredTraces.join(", ")}`,
      `Missing env: ${env.missing.join(", ") || "none"}`
    ],
    blockers: [...env.missing, ...files.missing],
    acceptanceCriteria: [
      "Vision room classification returns structured JSON for at least 10 uploaded photos",
      "Property chat refuses unknown facts and creates a knowledge gap instead",
      "AI output logs model, latency, decision id and guardrail status",
      "Seller report is generated in plain Hungarian without unsupported claims"
    ]
  });
}

export function getSpatialProviderAcceptanceGate() {
  const env = envScore(["SPATIAL_WORKER_URL", "SPATIAL_WORKER_TOKEN", "STORAGE_PUBLIC_BASE_URL"]);
  const files = fileScore([
    "workers/spatial-gpu/worker.py",
    "docker-compose.gpu.yml",
    "lib/providers/spatial-provider-contract.ts",
    "app/api/3d/reconstruction/dispatch/route.ts",
    "app/api/3d/manifests/validate/route.ts",
    "app/api/3d/acceptance-pack/route.ts",
    "app/spatial/[sceneId]/page.tsx"
  ]);
  const minimum = spatialProviderOutputContract.minimumScores;
  const score = weighted([[files.score, 55], [env.score, 30], [100, 15]]);
  return gate({
    key: "spatial_provider_acceptance",
    label: "3. 3D / digital twin provider acceptance gate",
    target: "Amerikai szint: capture inputból validált .ksplat/.splat/.ply scene manifest, QA gate, viewer deploy és disclosure.",
    score,
    evidence: [
      `Accepted outputs: ${spatialProviderOutputContract.acceptedAssets.join(", ")}`,
      `Minimum scores: coverage ${minimum.coverage}, geometry ${minimum.geometry}, texture ${minimum.texture}, viewer ${minimum.viewer}`,
      `Missing env: ${env.missing.join(", ") || "none"}`
    ],
    blockers: [...env.missing, ...files.missing],
    acceptanceCriteria: [
      "Worker/provider returns scene.manifest.json with checksum",
      "Manifest contains preview image and at least one .ksplat/.splat/.ply asset",
      "Quality scores pass minimum thresholds",
      "Human QA review approves scene before public viewer deploy",
      "Viewer includes digital twin disclosure and tenant-safe sharing controls"
    ]
  });
}

export function getPremiumUxBenchmarkGate() {
  const files = fileScore([
    "app/page.tsx",
    "app/listing/[slug]/page.tsx",
    "app/dashboard/premium-demo/page.tsx",
    "app/dashboard/core-flow/page.tsx",
    "app/dashboard/v20-test-center/page.tsx",
    "app/dashboard/v22-american-grade/page.tsx"
  ]);
  const benchmark = [
    { key: "zillow_showcase_like_public_listing", label: "Zillow Showcase-szerű public listing", target: "hero + gallery + 3D + floorplan + CTA egy képernyőn" },
    { key: "matterport_like_spatial_entry", label: "Matterport-szerű tour belépési pont", target: "viewer CTA, disclosure, room navigation placeholder" },
    { key: "seller_report_wow", label: "Tulajdonosi riport wow", target: "megtekintések, leadek, forró leadek, AI javaslat" },
    { key: "mobile_first", label: "Mobil-first", target: "lead form és gallery mobilon elsődleges" },
    { key: "two_minute_demo", label: "2 perces demo", target: "egy mintaingatlanon végigmutatható" }
  ];
  return gate({
    key: "premium_ux_benchmark",
    label: "4. Premium UX benchmark gate",
    target: "Amerikai szint: nem menüket kell látni, hanem 2 perc alatt egy látványos, eladható ingatlanértékesítési élményt.",
    score: weighted([[files.score, 70], [100, 30]]),
    evidence: benchmark.map((item) => `${item.label}: ${item.target}`),
    blockers: files.missing,
    acceptanceCriteria: [
      "Public listing mobile screen has hero, price, facts, gallery and lead CTA above the fold",
      "3D/360 entry is visible without searching",
      "Seller report has a printable/shareable owner-friendly version",
      "Demo script can be completed in 2 minutes with one sample listing"
    ]
  });
}

export function getCrmRevenueAutomationQaGate() {
  const files = fileScore([
    "lib/lead-scoring.ts",
    "lib/follow-up.ts",
    "lib/deal-pipeline.ts",
    "lib/offer.ts",
    "app/dashboard/live-crm/page.tsx",
    "app/dashboard/sales/page.tsx",
    "app/dashboard/deals/page.tsx",
    "app/api/leads/[id]/recalculate-score/route.ts",
    "app/api/leads/[id]/follow-up/route.ts"
  ]);
  const automations = [
    "Lead score recalculation after lead_submit",
    "Hot lead call task within 2 hours",
    "Deal stage and probability update",
    "Seller activity feed entry",
    "Follow-up draft with call script and email",
    "Daily AI manager prioritization"
  ];
  return gate({
    key: "crm_revenue_automation_qa",
    label: "5. CRM revenue automation QA gate",
    target: "Amerikai szint: leadből automatikus sales action, deal pipeline és mérhető revenue forecast legyen.",
    score: weighted([[files.score, 75], [100, 25]]),
    evidence: automations,
    blockers: files.missing,
    acceptanceCriteria: [
      "New lead creates score, status and at least one next-best-action",
      "81+ lead creates high-priority follow-up task",
      "Viewing request updates deal probability and appointment queue",
      "Seller report includes lead quality and recommended next action"
    ]
  });
}

export function getProviderCertificationMatrix() {
  const matrix: ProviderCertification[] = [
    {
      key: "openai",
      label: "OpenAI multimodal AI",
      owner: "ai/platform",
      mode: process.env.OPENAI_API_KEY ? "live" : "dry_run",
      requiredEnv: ["OPENAI_API_KEY", "OPENAI_MODEL_TEXT", "OPENAI_MODEL_VISION"],
      missingEnv: envScore(["OPENAI_API_KEY", "OPENAI_MODEL_TEXT", "OPENAI_MODEL_VISION"]).missing,
      startRequired: true,
      slaTarget: "AI generation and chat guardrail responses under agreed pilot latency",
      smokeTest: "vision room classification + listing text + property chat unknown-answer eval",
      rollback: "disable live AI actions and show agent-review-only mock suggestions"
    },
    {
      key: "auth",
      label: "Clerk/Auth.js tenant-safe auth",
      owner: "platform",
      mode: process.env.AUTH_SECRET ? "live" : "dry_run",
      requiredEnv: ["AUTH_PROVIDER", "AUTH_SECRET"],
      missingEnv: envScore(["AUTH_PROVIDER", "AUTH_SECRET"]).missing,
      startRequired: true,
      slaTarget: "99.9% login/session availability",
      smokeTest: "agent/admin/seller role route guard smoke",
      rollback: "disable public writes and fall back to admin-created demo access"
    },
    {
      key: "storage",
      label: "Cloudflare R2 / S3 asset storage",
      owner: "platform",
      mode: process.env.STORAGE_DRIVER ? "live" : "dry_run",
      requiredEnv: [...storageLiveContract.requiredEnv],
      missingEnv: envScore([...storageLiveContract.requiredEnv]).missing,
      startRequired: true,
      slaTarget: "99.9% upload intent and public CDN availability",
      smokeTest: storageLiveContract.smokeTests.join(" + "),
      rollback: "freeze uploads and keep existing demo assets"
    },
    {
      key: "email",
      label: "Resend transactional email",
      owner: "growth",
      mode: process.env.RESEND_API_KEY ? "live" : "dry_run",
      requiredEnv: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
      missingEnv: envScore(["RESEND_API_KEY", "RESEND_FROM_EMAIL"]).missing,
      startRequired: true,
      slaTarget: "seller report and lead notification delivered under 60 seconds",
      smokeTest: "send test report email and lead notification",
      rollback: "manual email export from report page"
    },
    {
      key: "billing",
      label: "Stripe/Barion paid launch",
      owner: "finance",
      mode: process.env.STRIPE_SECRET_KEY || process.env.BARION_POS_KEY ? "live" : "dry_run",
      requiredEnv: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "BARION_POS_KEY"],
      missingEnv: envScore(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "BARION_POS_KEY"]).missing,
      startRequired: false,
      slaTarget: "paid launch only: checkout and webhook verified",
      smokeTest: billingLiveContract.requiredForPaidLaunch.join(" + "),
      rollback: billingLiveContract.pilotAllowedFallback
    },
    {
      key: "calendar",
      label: "Google Calendar booking",
      owner: "sales",
      mode: process.env.GOOGLE_CALENDAR_CLIENT_ID ? "live" : "dry_run",
      requiredEnv: ["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET", "GOOGLE_CALENDAR_REDIRECT_URI"],
      missingEnv: envScore(["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET", "GOOGLE_CALENDAR_REDIRECT_URI"]).missing,
      startRequired: false,
      slaTarget: "viewing booking writes event and sends confirmation",
      smokeTest: calendarLiveContract.requiredForFullAutomation.join(" + "),
      rollback: calendarLiveContract.pilotFallback
    },
    {
      key: "monitoring",
      label: "Sentry/PostHog observability",
      owner: "ops",
      mode: process.env.SENTRY_DSN || process.env.POSTHOG_KEY ? "live" : "dry_run",
      requiredEnv: ["SENTRY_DSN", "POSTHOG_KEY"],
      missingEnv: envScore(["SENTRY_DSN", "POSTHOG_KEY"]).missing,
      startRequired: true,
      slaTarget: "errors and funnel events visible within 5 minutes",
      smokeTest: "capture test error and lead funnel event",
      rollback: "server logs + CSV analytics export"
    }
  ];
  return matrix;
}

export function getProviderCertificationGate() {
  const matrix = getProviderCertificationMatrix();
  const scores = matrix.map((provider) => {
    const env = envScore(provider.requiredEnv);
    const baseline = provider.startRequired ? 0 : 60;
    return Math.max(baseline, env.score);
  });
  const score = Math.round(scores.reduce((sum, item) => sum + item, 0) / scores.length);
  const blockers = matrix.flatMap((provider) => provider.startRequired ? provider.missingEnv.map((env) => `${provider.key}:${env}`) : []);
  return gate({
    key: "provider_certification",
    label: "6. Provider certification matrix",
    target: "Amerikai szint: minden külső providernek saját SLA, smoke test, rollback és live/dry-run státusz kell.",
    score,
    evidence: matrix.map((provider) => `${provider.label}: ${provider.mode}, missing ${provider.missingEnv.length}`),
    blockers,
    acceptanceCriteria: [
      "Auth, storage, email, OpenAI and monitoring are live before public pilot",
      "Billing and calendar may remain manual/dry-run only if the pilot contract states it",
      "Every provider has a rollback path",
      "Every provider has a smoke test owner and command/runbook"
    ]
  });
}

export function getV22AmericanGradeReadiness() {
  const gates = [
    getProductionBuildProofGate(),
    getLiveAiSlaGate(),
    getSpatialProviderAcceptanceGate(),
    getPremiumUxBenchmarkGate(),
    getCrmRevenueAutomationQaGate(),
    getProviderCertificationGate()
  ];
  const score = Math.round(gates.reduce((sum, item) => sum + item.score, 0) / gates.length);
  const status: GateStatus = certificationStatus(score);
  const blockers = gates.flatMap((gate) => gate.blockers.map((blocker) => `${gate.key}:${blocker}`));
  const americanGradeStartSequence = [
    "1. npm run release:v22-check",
    "2. npm install && npm run db:push && npm run db:seed",
    "3. npm run typecheck && npm run build",
    "4. Configure live env: OpenAI + Auth + R2/S3 + Resend + Sentry/PostHog",
    "5. Run core pilot flow with one premium demo listing",
    "6. Run 3D provider dry-run/live smoke and approve manifest via QA",
    "7. Send seller report email/PDF and capture lead funnel analytics",
    "8. Only then start external pilot traffic"
  ];
  return {
    version: "0.22.0",
    label: "V22 American-grade launch hardening",
    score,
    status,
    gates,
    providers: getProviderCertificationMatrix(),
    blockers,
    checksum: hash({ score, gates, providers: getProviderCertificationMatrix().map((p) => ({ key: p.key, mode: p.mode, missing: p.missingEnv.length })) }),
    americanGradeStartSequence,
    finalCut: score >= 90 && blockers.length === 0 ? "pilot_can_start" : "do_not_start_external_paid_pilot_yet"
  };
}
