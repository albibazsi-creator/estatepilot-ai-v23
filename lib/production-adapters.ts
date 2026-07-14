import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export type AdapterStatus = "live" | "partial" | "mock" | "blocked";

export type AdapterDefinition = {
  adapterKey: string;
  provider: string;
  area: string;
  requiredEnv: string[];
  fallbackMode: string;
  ownerArea: string;
  notes: string;
};

export const productionAdapterDefinitions: AdapterDefinition[] = [
  {
    adapterKey: "auth.session",
    provider: "clerk_or_authjs",
    area: "authentication",
    requiredEnv: ["AUTH_PROVIDER", "AUTH_SECRET"],
    fallbackMode: "dev_auth",
    ownerArea: "platform",
    notes: "Éles pilotnál a dev user stub nem elég: Clerk vagy Auth.js session kell."
  },
  {
    adapterKey: "ai.vision_text",
    provider: "openai",
    area: "ai",
    requiredEnv: ["OPENAI_API_KEY"],
    fallbackMode: "mock_ai",
    ownerArea: "ai",
    notes: "Képelemzés, listing copy, seller report és property chat valódi provider mögé kerül."
  },
  {
    adapterKey: "storage.media",
    provider: "cloudflare_r2_or_s3",
    area: "storage",
    requiredEnv: ["STORAGE_DRIVER", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "STORAGE_PUBLIC_BASE_URL"],
    fallbackMode: "local_upload",
    ownerArea: "platform",
    notes: "Presigned upload, thumbnail és CDN URL nélkül nem élesíthető a média-flow."
  },
  {
    adapterKey: "email.transactional",
    provider: "resend",
    area: "notifications",
    requiredEnv: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
    fallbackMode: "notification_log_only",
    ownerArea: "growth",
    notes: "Lead értesítés, seller report és booking confirmation csak logolás helyett emailt küld."
  },
  {
    adapterKey: "billing.checkout",
    provider: "stripe_or_barion",
    area: "billing",
    requiredEnv: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    fallbackMode: "manual_invoice",
    ownerArea: "billing",
    notes: "Magyar pilotnál Barion is választható, de a checkout/webhook flow-nak végig kell mennie."
  },
  {
    adapterKey: "calendar.booking",
    provider: "google_calendar",
    area: "calendar",
    requiredEnv: ["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET", "GOOGLE_CALENDAR_REDIRECT_URI"],
    fallbackMode: "ics_export",
    ownerArea: "sales",
    notes: "A megtekintési időpontok Google Calendarba kerüljenek, ne csak belső táblába."
  },
  {
    adapterKey: "monitoring.runtime",
    provider: "sentry_posthog",
    area: "observability",
    requiredEnv: ["SENTRY_DSN", "POSTHOG_KEY"],
    fallbackMode: "dashboard_logs",
    ownerArea: "ops",
    notes: "Éles pilotnál error és product analytics is kell, különben vakon fut a rendszer."
  }
];

function currentEnvValue(name: string) {
  const direct = process.env[name];
  if (direct) return direct;
  const envRecord = env as unknown as Record<string, unknown>;
  const value = envRecord[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function evaluateAdapter(definition: AdapterDefinition) {
  const missing = definition.requiredEnv.filter((key) => !currentEnvValue(key));
  const configured = definition.requiredEnv.length - missing.length;
  const status: AdapterStatus = missing.length === 0 ? "live" : configured > 0 ? "partial" : "mock";
  return {
    ...definition,
    missingEnv: missing,
    configuredEnv: configured,
    status,
    mode: status === "live" ? "live_provider" : definition.fallbackMode
  };
}

export async function syncProductionAdapters(agencyId: string) {
  const evaluated = productionAdapterDefinitions.map(evaluateAdapter);
  await Promise.all(evaluated.map((adapter) => prisma.productionAdapterConfig.upsert({
    where: { agencyId_adapterKey: { agencyId, adapterKey: adapter.adapterKey } },
    update: {
      provider: adapter.provider,
      area: adapter.area,
      mode: adapter.mode,
      status: adapter.status,
      requiredEnvJson: adapter.requiredEnv,
      missingEnvJson: adapter.missingEnv,
      fallbackMode: adapter.fallbackMode,
      ownerArea: adapter.ownerArea,
      notes: adapter.notes,
      lastCheckedAt: new Date()
    },
    create: {
      agencyId,
      adapterKey: adapter.adapterKey,
      provider: adapter.provider,
      area: adapter.area,
      mode: adapter.mode,
      status: adapter.status,
      requiredEnvJson: adapter.requiredEnv,
      missingEnvJson: adapter.missingEnv,
      fallbackMode: adapter.fallbackMode,
      ownerArea: adapter.ownerArea,
      notes: adapter.notes,
      lastCheckedAt: new Date()
    }
  })));
  return evaluated;
}

export async function getProductionAdapterSummary(agencyId: string) {
  const adapters = await syncProductionAdapters(agencyId);
  const live = adapters.filter((a) => a.status === "live").length;
  const partial = adapters.filter((a) => a.status === "partial").length;
  const mock = adapters.filter((a) => a.status === "mock").length;
  const score = Math.round((live * 100 + partial * 55 + mock * 20) / Math.max(1, adapters.length));
  const blockers = adapters
    .filter((a) => ["auth.session", "ai.vision_text", "storage.media", "email.transactional"].includes(a.adapterKey) && a.status !== "live")
    .map((a) => `${a.adapterKey}: ${a.missingEnv.join(", ") || "nincs teljes live konfiguráció"}`);
  return { score, status: score >= 85 ? "pilot_live_ready" : score >= 65 ? "pilot_partial" : "mock_heavy", live, partial, mock, adapters, blockers };
}
