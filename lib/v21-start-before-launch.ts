import crypto from "crypto";
import fs from "fs";
import path from "path";

export type V21Status = "ready" | "warning" | "blocked";

type LaunchPillar = {
  key: string;
  title: string;
  goal: string;
  status: V21Status;
  score: number;
  evidence: string[];
  missing: string[];
  startGate: string;
  owner: string;
  nextActions: string[];
};

const ROOT = process.cwd();

function exists(relativePath: string) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function presentEnv(keys: string[]) {
  return keys.filter((key) => Boolean(process.env[key] && String(process.env[key]).trim().length > 0));
}

function scoreStatus(score: number): V21Status {
  if (score >= 82) return "ready";
  if (score >= 58) return "warning";
  return "blocked";
}

function checksum(input: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 24);
}

function makePillar(input: Omit<LaunchPillar, "status">): LaunchPillar {
  return { ...input, status: scoreStatus(input.score) };
}

function fileGate(files: string[]) {
  const missing = files.filter((file) => !exists(file));
  return { missing, score: Math.round(((files.length - missing.length) / Math.max(1, files.length)) * 100) };
}

function envGate(keys: string[]) {
  const present = presentEnv(keys);
  const missing = keys.filter((key) => !present.includes(key));
  return { present, missing, score: Math.round((present.length / Math.max(1, keys.length)) * 100) };
}

export function getBuildHardeningPlan() {
  const requiredFiles = [
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "prisma/schema.prisma",
    "Dockerfile",
    "vercel.json",
    ".github/workflows/ci.yml",
    ".github/workflows/pilot-readiness.yml",
    "scripts/v20-no-deps-preflight.mjs",
    "scripts/v21-start-before-launch.mjs"
  ];
  const files = fileGate(requiredFiles);
  const pkg = readJson("package.json");
  const requiredScripts = ["build", "typecheck", "db:push", "db:seed", "release:v20-check", "release:v21-check"];
  const missingScripts = requiredScripts.filter((script) => !pkg.scripts?.[script]);
  const score = Math.round(files.score * 0.65 + ((requiredScripts.length - missingScripts.length) / requiredScripts.length) * 35);
  return {
    score,
    status: scoreStatus(score),
    requiredFiles,
    missingFiles: files.missing,
    requiredScripts,
    missingScripts,
    commandSequence: [
      "npm run release:v21-check",
      "npm install",
      "npm run db:push",
      "npm run db:seed",
      "npm run typecheck",
      "npm run build",
      "npm run dev"
    ],
    hardRule: "Start előtt minimum a release:v21-check + typecheck + build + egy kézi core-flow smoke menjen át."
  };
}

export function getLiveAiWiringPlan() {
  const env = envGate(["OPENAI_API_KEY", "OPENAI_MODEL_TEXT", "OPENAI_MODEL_VISION"]);
  const files = fileGate([
    "lib/ai.ts",
    "lib/ai-trace.ts",
    "lib/chat-guardrails.ts",
    "app/api/listings/[id]/ai/generate-description/route.ts",
    "app/api/public/listings/[slug]/chat/route.ts",
    "app/dashboard/ai-evals/page.tsx"
  ]);
  const score = Math.round(files.score * 0.55 + env.score * 0.45);
  return {
    score,
    status: scoreStatus(score),
    provider: "OpenAI multimodal",
    requiredEnv: ["OPENAI_API_KEY", "OPENAI_MODEL_TEXT", "OPENAI_MODEL_VISION"],
    missingEnv: env.missing,
    missingFiles: files.missing,
    liveEndpoints: [
      "/api/listings/:id/ai/generate-description",
      "/api/listings/:id/ai/generate-social-posts",
      "/api/listings/:id/ai/generate-reels-script",
      "/api/public/listings/:slug/chat"
    ],
    productionRules: [
      "AI chat csak property knowledge base-ből válaszolhat.",
      "Bizonytalan adatnál lead-kérdés jön létre, nem hallucinált válasz.",
      "Minden AI döntés trace-be és döntésnaplóba kerül.",
      "Stagingelt képre kötelező disclosure."
    ]
  };
}

export function getLive3dProviderBridge() {
  const env = envGate(["SPATIAL_WORKER_URL", "SPATIAL_WORKER_TOKEN", "STORAGE_PUBLIC_BASE_URL"]);
  const files = fileGate([
    "workers/spatial-gpu/worker.py",
    "docker-compose.gpu.yml",
    "lib/spatial-v19.ts",
    "app/api/3d/orchestrator/route.ts",
    "app/api/3d/reconstruction/dispatch/route.ts",
    "app/spatial/[sceneId]/page.tsx"
  ]);
  const score = Math.round(files.score * 0.62 + env.score * 0.38);
  return {
    score,
    status: scoreStatus(score),
    bridgeMode: env.missing.length === 0 ? "live_worker_candidate" : "dry_run_until_worker_env_configured",
    requiredEnv: ["SPATIAL_WORKER_URL", "SPATIAL_WORKER_TOKEN", "STORAGE_PUBLIC_BASE_URL"],
    missingEnv: env.missing,
    missingFiles: files.missing,
    acceptedOutputs: ["scene.manifest.json", ".ksplat", ".splat", ".ply", "preview.jpg", "quality.json"],
    qaGates: ["manifest checksum", "coverage score", "geometry score", "texture score", "viewer score", "AI staging / digital twin disclosure"]
  };
}

export function getPremiumDemoFlow() {
  const files = fileGate([
    "app/page.tsx",
    "app/listing/[slug]/page.tsx",
    "app/dashboard/demo-center/page.tsx",
    "app/dashboard/core-flow/page.tsx",
    "app/dashboard/v20-test-center/page.tsx",
    "app/dashboard/v21-start/page.tsx"
  ]);
  const score = files.score;
  return {
    score,
    status: scoreStatus(score),
    missingFiles: files.missing,
    demoSequence: [
      "1. Landing: AI Listing Conversion OS pozicionálás.",
      "2. Agent dashboard: egy prémium listing állapota.",
      "3. Public listing: galéria, AI leírás, 360/3D blokk, lead form.",
      "4. Lead beérkezik: score + next best action.",
      "5. Seller report: tulajdonos látja a munkát és érdeklődést.",
      "6. 3D pipeline: digital twin readiness és review queue."
    ],
    uxPrinciples: ["kevesebb menü a demóban", "nagy vizuális elemek", "mobil-first public listing", "egy brutál jó mintaingatlan", "2 perces wow-flow"]
  };
}

export function getLiveCrmAutomationPlan() {
  const files = fileGate([
    "lib/lead-scoring.ts",
    "lib/follow-up.ts",
    "lib/deal-pipeline.ts",
    "lib/offer.ts",
    "app/dashboard/sales/page.tsx",
    "app/dashboard/deals/page.tsx",
    "app/api/leads/[id]/recalculate-score/route.ts",
    "app/api/leads/[id]/follow-up/route.ts"
  ]);
  return {
    score: files.score,
    status: scoreStatus(files.score),
    missingFiles: files.missing,
    automationLoop: [
      "lead_submit event",
      "lead score újraszámolás",
      "deal stage frissítés",
      "follow-up task létrehozás",
      "agent daily AI manager prioritás",
      "seller reportba bekerülő aktivitás"
    ],
    startRules: [
      "81+ score: hívás 2 órán belül",
      "61–80 score: személyre szabott email + viewing slot",
      "31–60 score: nurture follow-up",
      "0–30 score: hideg lead, csak automation queue"
    ]
  };
}

export function getIntegrationLaunchMatrix() {
  const providers = [
    { key: "auth", label: "Clerk/Auth.js", env: ["AUTH_PROVIDER", "AUTH_SECRET"], requiredForStart: true },
    { key: "storage", label: "Cloudflare R2 / S3", env: ["STORAGE_DRIVER", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "STORAGE_PUBLIC_BASE_URL"], requiredForStart: true },
    { key: "email", label: "Resend", env: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"], requiredForStart: true },
    { key: "calendar", label: "Google Calendar", env: ["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET", "GOOGLE_CALENDAR_REDIRECT_URI"], requiredForStart: false },
    { key: "billing", label: "Stripe/Barion", env: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "BARION_POS_KEY"], requiredForStart: false },
    { key: "analytics", label: "Sentry/PostHog", env: ["SENTRY_DSN", "POSTHOG_KEY"], requiredForStart: true }
  ];
  const evaluated = providers.map((provider) => {
    const gate = envGate(provider.env);
    return { ...provider, presentEnv: gate.present, missingEnv: gate.missing, score: gate.score, status: scoreStatus(provider.requiredForStart ? gate.score : Math.max(58, gate.score)) };
  });
  const score = Math.round(evaluated.reduce((sum, item) => sum + item.score, 0) / evaluated.length);
  return {
    score,
    status: scoreStatus(score),
    providers: evaluated,
    minimumStartCut: "Auth + storage + email + OpenAI + monitoring legyen live; billing/calendar maradhat pilotban manual/skeleton, ha dokumentált."
  };
}

export function getV21StartBeforeLaunchReadiness() {
  const build = getBuildHardeningPlan();
  const ai = getLiveAiWiringPlan();
  const spatial = getLive3dProviderBridge();
  const ux = getPremiumDemoFlow();
  const crm = getLiveCrmAutomationPlan();
  const integrations = getIntegrationLaunchMatrix();

  const pillars: LaunchPillar[] = [
    makePillar({
      key: "build_runtime_hardening",
      title: "1. Stabil build + futó app",
      goal: "A v20-ból bizonyítottan futó, buildelhető pilot legyen.",
      score: build.score,
      evidence: [build.hardRule, `Missing files: ${build.missingFiles.length}`, `Missing scripts: ${build.missingScripts.length}`],
      missing: [...build.missingFiles, ...build.missingScripts.map((script) => `script:${script}`)],
      startGate: "release:v21-check + typecheck + build + manual core smoke",
      owner: "platform",
      nextActions: build.commandSequence
    }),
    makePillar({
      key: "live_ai_provider",
      title: "2. Valódi AI provider bekötés",
      goal: "Mock AI helyett live OpenAI vision/text/chat provider-kapcsolat.",
      score: ai.score,
      evidence: [`Provider: ${ai.provider}`, `Missing env: ${ai.missingEnv.join(", ") || "none"}`, `Endpoints: ${ai.liveEndpoints.length}`],
      missing: [...ai.missingEnv, ...ai.missingFiles],
      startGate: "OPENAI_API_KEY + AI eval smoke + guardrail pass",
      owner: "ai",
      nextActions: ["OpenAI env beállítás", "1 mintaingatlan képelemzés", "AI eval futtatás", "guardrail események ellenőrzése"]
    }),
    makePillar({
      key: "live_3d_provider",
      title: "3. Valódi 3D/digital twin provider bridge",
      goal: "A 3D pipeline külső providerhez vagy GPU workerhez kapcsolható legyen.",
      score: spatial.score,
      evidence: [`Mode: ${spatial.bridgeMode}`, `Missing env: ${spatial.missingEnv.join(", ") || "none"}`, `Accepted outputs: ${spatial.acceptedOutputs.join(", ")}`],
      missing: [...spatial.missingEnv, ...spatial.missingFiles],
      startGate: "worker health + manifest validation + QA review",
      owner: "spatial",
      nextActions: ["SPATIAL_WORKER_URL/TOKEN beállítás", "dry-run dispatch", "scene manifest validálás", "viewer preview teszt"]
    }),
    makePillar({
      key: "premium_ux_demo",
      title: "4. Prémium Zillow-szerű demo élmény",
      goal: "Egy ingatlan 2 perc alatt wow-flow-val bemutatható legyen.",
      score: ux.score,
      evidence: [`Demo steps: ${ux.demoSequence.length}`, `UX principles: ${ux.uxPrinciples.length}`],
      missing: ux.missingFiles,
      startGate: "egy mintaingatlan public listing + seller report + 3D blokk",
      owner: "product/design",
      nextActions: ux.demoSequence
    }),
    makePillar({
      key: "crm_sales_automation",
      title: "5. CRM + AI sales automation live loop",
      goal: "Leadből score, task, deal, follow-up és seller activity készüljön.",
      score: crm.score,
      evidence: [`Automation loop steps: ${crm.automationLoop.length}`, `Missing files: ${crm.missingFiles.length}`],
      missing: crm.missingFiles,
      startGate: "lead submit után 1 percen belül task + next best action",
      owner: "growth/sales",
      nextActions: crm.automationLoop
    }),
    makePillar({
      key: "launch_integrations",
      title: "6. Start előtti integrációs kapcsolók",
      goal: "Auth, storage, email, monitoring live; calendar/billing dokumentált pilot fallback.",
      score: integrations.score,
      evidence: [`Providers: ${integrations.providers.length}`, integrations.minimumStartCut],
      missing: integrations.providers.flatMap((provider) => provider.requiredForStart ? provider.missingEnv : []),
      startGate: "provider health matrix legalább pilot-live szint",
      owner: "ops",
      nextActions: integrations.providers.map((provider) => `${provider.label}: ${provider.status}`)
    })
  ];

  const score = Math.round(pillars.reduce((sum, pillar) => sum + pillar.score, 0) / pillars.length);
  const blockers = pillars.filter((pillar) => pillar.status === "blocked" || (pillar.missing.length > 0 && ["build_runtime_hardening", "live_ai_provider", "launch_integrations"].includes(pillar.key))).map((pillar) => ({ key: pillar.key, title: pillar.title, missing: pillar.missing }));
  const status: V21Status = blockers.length ? "warning" : scoreStatus(score);

  return {
    version: "v21-start-before-launch",
    status,
    score,
    checksum: checksum({ score, pillars: pillars.map((p) => ({ key: p.key, score: p.score, missing: p.missing })) }),
    generatedAt: new Date().toISOString(),
    pillars,
    blockers,
    build,
    ai,
    spatial,
    ux,
    crm,
    integrations,
    finalStartSequence: [
      "1. npm run release:v21-check",
      "2. npm install",
      "3. npm run db:push && npm run db:seed",
      "4. npm run typecheck && npm run build",
      "5. OPENAI + R2/S3 + Resend + Auth env live",
      "6. Egy mintaingatlan end-to-end teszt: feltöltés → AI → public page → lead → seller report → 3D dry/live preview",
      "7. Pilot csak akkor induljon, ha nincs critical blocker."
    ]
  };
}
