import { env } from "@/lib/env";

export type DoctorSeverity = "ok" | "warn" | "error";

export type DoctorCheck = {
  key: string;
  label: string;
  severity: DoctorSeverity;
  status: string;
  nextAction?: string;
};

function present(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function runConfigDoctor(): DoctorCheck[] {
  const checks: DoctorCheck[] = [];

  checks.push({
    key: "app_url",
    label: "Publikus app URL",
    severity: env.NEXT_PUBLIC_APP_URL.includes("localhost") && env.APP_ENV === "production" ? "error" : "ok",
    status: env.NEXT_PUBLIC_APP_URL,
    nextAction: env.NEXT_PUBLIC_APP_URL.includes("localhost") ? "Állítsd be a végleges domaint Vercel/Netlify alatt." : undefined
  });

  checks.push({
    key: "database",
    label: "PostgreSQL DATABASE_URL",
    severity: present(env.DATABASE_URL) ? "ok" : "error",
    status: present(env.DATABASE_URL) ? "beállítva" : "hiányzik",
    nextAction: "Neon / Supabase / Railway Postgres URL szükséges."
  });

  checks.push({
    key: "auth",
    label: "Auth provider",
    severity: env.AUTH_PROVIDER === "dev" ? "warn" : present(env.CLERK_SECRET_KEY) || present(env.AUTH_SECRET) ? "ok" : "error",
    status: env.AUTH_PROVIDER,
    nextAction: env.AUTH_PROVIDER === "dev" ? "Demohoz jó, élesben Clerk vagy Auth.js kell." : "Ellenőrizd a provider secret kulcsokat."
  });

  checks.push({
    key: "storage",
    label: "Képtárolás",
    severity: env.STORAGE_DRIVER === "local" ? "warn" : present(env.STORAGE_PUBLIC_BASE_URL) ? "ok" : "error",
    status: `${env.STORAGE_DRIVER}${env.STORAGE_PUBLIC_BASE_URL ? " + public base" : ""}`,
    nextAction: env.STORAGE_DRIVER === "local" ? "Demohoz jó, élesben Cloudflare R2 / S3 kell." : "STORAGE_PUBLIC_BASE_URL és bucket credentials legyen beállítva."
  });

  checks.push({
    key: "ai",
    label: "OpenAI AI réteg",
    severity: present(env.OPENAI_API_KEY) ? "ok" : "warn",
    status: present(env.OPENAI_API_KEY) ? `${env.OPENAI_MODEL_TEXT} / ${env.OPENAI_MODEL_VISION}` : "mock mód",
    nextAction: "OPENAI_API_KEY kell a valós képelemzéshez és szöveggeneráláshoz."
  });

  checks.push({
    key: "email",
    label: "Email küldés",
    severity: present(env.RESEND_API_KEY) && present(env.RESEND_FROM_EMAIL) ? "ok" : "warn",
    status: present(env.RESEND_API_KEY) ? "Resend előkészítve" : "mock mód",
    nextAction: "RESEND_API_KEY + RESEND_FROM_EMAIL kell riportokhoz és lead értesítésekhez."
  });

  checks.push({
    key: "billing",
    label: "Fizetés",
    severity: present(env.STRIPE_SECRET_KEY) || present(env.BARION_POS_KEY) ? "ok" : "warn",
    status: present(env.STRIPE_SECRET_KEY) ? "Stripe" : present(env.BARION_POS_KEY) ? `Barion ${env.BARION_ENV}` : "manual checkout",
    nextAction: "Stripe vagy Barion kulcs kell éles fizetéshez."
  });

  checks.push({
    key: "calendar",
    label: "Google Calendar",
    severity: present(env.GOOGLE_CALENDAR_CLIENT_ID) && present(env.GOOGLE_CALENDAR_CLIENT_SECRET) ? "ok" : "warn",
    status: present(env.GOOGLE_CALENDAR_CLIENT_ID) ? "OAuth részben beállítva" : "belső slot rendszer",
    nextAction: "Google Cloud OAuth app + redirect URI kell a szinkronhoz."
  });

  checks.push({
    key: "publish_gate",
    label: "Publish checklist gate",
    severity: env.REQUIRE_PUBLISH_CHECKLIST ? "ok" : "warn",
    status: env.REQUIRE_PUBLISH_CHECKLIST ? "bekapcsolva" : "kikapcsolva",
    nextAction: "Élesben maradjon bekapcsolva, hogy hiányos listing ne menjen publikusan ki."
  });

  checks.push({
    key: "portal_export",
    label: "Portál export mód",
    severity: env.PORTAL_EXPORT_MODE === "api" ? "ok" : "warn",
    status: env.PORTAL_EXPORT_MODE,
    nextAction: "Demohoz mock/file elég, éles portál-integrációhoz API mód + hitelesítés kell."
  });

  checks.push({
    key: "observability",
    label: "Monitoring",
    severity: present(env.SENTRY_DSN) || present(env.POSTHOG_KEY) ? "ok" : "warn",
    status: [present(env.SENTRY_DSN) ? "Sentry" : null, present(env.POSTHOG_KEY) ? "PostHog" : null].filter(Boolean).join(" + ") || "nincs",
    nextAction: "Sentry hibakövetés és PostHog product analytics javasolt."
  });

  return checks;
}

export function summarizeDoctor(checks = runConfigDoctor()) {
  const errors = checks.filter((check) => check.severity === "error").length;
  const warnings = checks.filter((check) => check.severity === "warn").length;
  return {
    readyForProduction: errors === 0 && warnings <= 1,
    errors,
    warnings,
    ok: checks.filter((check) => check.severity === "ok").length,
    score: Math.max(0, Math.round(((checks.length - errors * 1.5 - warnings * 0.5) / checks.length) * 100))
  };
}
