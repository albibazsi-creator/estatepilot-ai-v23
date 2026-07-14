import { prisma } from "@/lib/prisma";

export async function ensureLaunchChecklist(agencyId: string) {
  const defaults = [
    ["auth_provider", "Clerk/Auth.js éles session bekötés", "security", "todo", "critical"],
    ["r2_upload", "Cloudflare R2/S3 presigned upload élesítése", "storage", "todo", "critical"],
    ["openai_vision", "Valódi OpenAI Vision képelemzés bekötése", "ai", "todo", "critical"],
    ["resend_email", "Resend email küldés és domain verification", "notification", "todo", "high"],
    ["billing_provider", "Stripe/Barion fizetés provider kiválasztás", "billing", "todo", "high"],
    ["seller_pdf", "Seller report PDF render Playwright/Puppeteer alapon", "reports", "todo", "medium"],
    ["legal_docs", "ÁSZF/adatkezelési tájékoztató véglegesítése", "legal", "todo", "critical"],
    ["monitoring", "Sentry/PostHog/uptime monitoring bekötés", "ops", "todo", "high"],
    ["demo_seed", "3 erős demo ingatlan + képek + tour + riport", "sales", "done", "medium"],
    ["sales_script", "12 perces sales demo és objection handling", "sales", "done", "medium"]
  ] as const;
  for (const [key, title, area, status, severity] of defaults) {
    await prisma.launchChecklistItem.upsert({
      where: { agencyId_key: { agencyId, key } },
      update: {},
      create: { agencyId, key, title, area, status, severity }
    });
  }
  return prisma.launchChecklistItem.findMany({ where: { agencyId }, orderBy: [{ area: "asc" }, { severity: "asc" }, { createdAt: "asc" }] });
}

export function calculateLaunchScore(items: Array<{ status: string; severity: string }>) {
  const weights: Record<string, number> = { critical: 25, high: 15, medium: 10, low: 5 };
  const total = items.reduce((sum, item) => sum + (weights[item.severity] ?? 10), 0) || 1;
  const done = items.filter((item) => item.status === "done").reduce((sum, item) => sum + (weights[item.severity] ?? 10), 0);
  const blockers = items.filter((item) => item.status !== "done" && item.severity === "critical").length;
  return { score: Math.round((done / total) * 100), blockers, done: items.filter((i) => i.status === "done").length, total: items.length };
}

export async function getLaunchReadiness(agencyId: string) {
  const items = await ensureLaunchChecklist(agencyId);
  return { items, summary: calculateLaunchScore(items) };
}
