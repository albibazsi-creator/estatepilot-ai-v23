import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export type ProviderDefinition = {
  provider: string;
  area: string;
  requiredEnv: string[];
  productionMode: string;
  mockMode: string;
  remediation: string;
};

export const providerDefinitions: ProviderDefinition[] = [
  { provider: "openai", area: "ai_vision_text", requiredEnv: ["OPENAI_API_KEY"], productionMode: "live", mockMode: "mock_ai", remediation: "Állítsd be az OPENAI_API_KEY változót, majd futtasd újra a provider checket." },
  { provider: "cloudflare_r2", area: "storage_uploads", requiredEnv: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "STORAGE_PUBLIC_BASE_URL"], productionMode: "presigned_upload", mockMode: "local_upload", remediation: "Hozz létre R2 bucketet, CORS-t, public base URL-t és presigned upload credentialt." },
  { provider: "resend", area: "email_notifications", requiredEnv: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"], productionMode: "transactional_email", mockMode: "notification_log_only", remediation: "Állítsd be Resend API kulcsot és validált FROM domain/email címet." },
  { provider: "stripe", area: "international_billing", requiredEnv: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"], productionMode: "live_checkout", mockMode: "manual_checkout", remediation: "Készíts Stripe product/price ID-ket és webhook endpointot." },
  { provider: "barion", area: "hungarian_billing", requiredEnv: ["BARION_POS_KEY", "BARION_PAYEE"], productionMode: "live_barion", mockMode: "manual_checkout", remediation: "Kösd be a Barion POS kulcsot, visszatérési URL-t és webhook validációt." },
  { provider: "google_calendar", area: "booking_calendar", requiredEnv: ["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET", "GOOGLE_CALENDAR_REDIRECT_URI"], productionMode: "oauth_calendar", mockMode: "ics_export", remediation: "Állítsd be Google OAuth consent screent és redirect URI-t." },
  { provider: "auth", area: "rbac_sessions", requiredEnv: ["AUTH_SECRET"], productionMode: "signed_sessions", mockMode: "demo_user_stub", remediation: "Kösd be Clerk/Auth.js session lookupot és kapcsold ki a demo user stubot." },
  { provider: "sentry", area: "error_monitoring", requiredEnv: ["SENTRY_DSN"], productionMode: "error_monitoring", mockMode: "console_only", remediation: "Add meg a Sentry DSN-t és kapcsold be a release/environment tageket." },
  { provider: "posthog", area: "product_analytics", requiredEnv: ["POSTHOG_KEY", "POSTHOG_HOST"], productionMode: "event_pipeline", mockMode: "db_event_tracking", remediation: "Add meg a PostHog kulcsot, hostot és ellenőrizd a client/server eventeket." }
];

function readRuntimeEnv(name: string) {
  return process.env[name] ?? "";
}

export function evaluateProvider(def: ProviderDefinition) {
  const missing = def.requiredEnv.filter((key) => !readRuntimeEnv(key));
  const status = missing.length === 0 ? "ready" : missing.length === def.requiredEnv.length ? "mock" : "partial";
  return {
    provider: def.provider,
    area: def.area,
    status,
    mode: status === "ready" ? def.productionMode : def.mockMode,
    requiredEnv: def.requiredEnv,
    missingEnv: missing,
    remediation: missing.length ? def.remediation : "Nincs teendő, a szükséges konfiguráció elérhető.",
    notes: status === "ready" ? "Éles provider módra kész." : "Demo/fallback módban marad, amíg a hiányzó környezeti változók nincsenek beállítva."
  };
}

export async function runProviderHealthCheck(agencyId?: string | null) {
  const checks = providerDefinitions.map(evaluateProvider);
  await Promise.all(checks.map((check) => prisma.providerHealthCheck.upsert({
    where: { agencyId_provider_area: { agencyId: agencyId ?? null, provider: check.provider, area: check.area } },
    create: {
      agencyId: agencyId ?? null,
      provider: check.provider,
      area: check.area,
      status: check.status,
      mode: check.mode,
      requiredEnvJson: check.requiredEnv,
      missingEnvJson: check.missingEnv,
      latencyMs: 0,
      notes: check.notes,
      remediation: check.remediation,
      metadataJson: { nodeEnv: env.NODE_ENV }
    },
    update: {
      status: check.status,
      mode: check.mode,
      requiredEnvJson: check.requiredEnv,
      missingEnvJson: check.missingEnv,
      latencyMs: 0,
      notes: check.notes,
      remediation: check.remediation,
      metadataJson: { nodeEnv: env.NODE_ENV },
      lastCheckedAt: new Date()
    }
  })));
  return checks;
}

export async function getProviderHealthSummary(agencyId?: string | null) {
  const existing = await prisma.providerHealthCheck.findMany({
    where: { agencyId: agencyId ?? null },
    orderBy: [{ area: "asc" }, { provider: "asc" }]
  });
  const checks = existing.length ? existing : await runProviderHealthCheck(agencyId);
  const ready = checks.filter((c) => c.status === "ready").length;
  const partial = checks.filter((c) => c.status === "partial").length;
  const mock = checks.filter((c) => c.status === "mock").length;
  const score = Math.round((ready * 100 + partial * 55 + mock * 25) / Math.max(1, checks.length));
  return { score, ready, partial, mock, total: checks.length, checks };
}
