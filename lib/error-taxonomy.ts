import { prisma } from "@/lib/prisma";

export const defaultErrorTaxonomy = [
  { code: "AUTH_REQUIRED", category: "auth", severity: "high", httpStatus: 401, publicMessage: "Bejelentkezés szükséges.", remediation: "Clerk/Auth.js session ellenőrzés és redirect.", ownerArea: "platform", isRetryable: false },
  { code: "RBAC_FORBIDDEN", category: "security", severity: "high", httpStatus: 403, publicMessage: "Ehhez nincs jogosultságod.", remediation: "Agency scope és role guard ellenőrzése.", ownerArea: "security", isRetryable: false },
  { code: "VALIDATION_FAILED", category: "input", severity: "medium", httpStatus: 400, publicMessage: "Hiányzó vagy hibás adat.", remediation: "Zod validáció és mezőszintű hibaüzenetek.", ownerArea: "product", isRetryable: false },
  { code: "GDPR_CONSENT_REQUIRED", category: "privacy", severity: "high", httpStatus: 400, publicMessage: "Adatkezelési hozzájárulás szükséges.", remediation: "Lead capture formon explicit consent required.", ownerArea: "legal", isRetryable: false },
  { code: "AI_PROVIDER_UNAVAILABLE", category: "ai", severity: "medium", httpStatus: 503, publicMessage: "Az AI szolgáltatás átmenetileg nem elérhető.", remediation: "Fallback mock output + retry queue.", ownerArea: "ai", isRetryable: true },
  { code: "STORAGE_UPLOAD_FAILED", category: "storage", severity: "medium", httpStatus: 502, publicMessage: "A feltöltés nem sikerült.", remediation: "R2/S3 presigned URL és mime/size audit.", ownerArea: "platform", isRetryable: true },
  { code: "PAYMENT_PROVIDER_ERROR", category: "billing", severity: "high", httpStatus: 502, publicMessage: "A fizetés feldolgozása nem sikerült.", remediation: "Stripe/Barion webhook replay és idempotency key.", ownerArea: "billing", isRetryable: true },
  { code: "CHAT_GUARDRAIL_BLOCKED", category: "ai_safety", severity: "medium", httpStatus: 200, publicMessage: "Erre nincs pontos adat a hirdetésben.", remediation: "Property knowledge base bővítése.", ownerArea: "ai", isRetryable: false },
  { code: "RATE_LIMITED", category: "abuse", severity: "medium", httpStatus: 429, publicMessage: "Túl sok kérés érkezett rövid idő alatt.", remediation: "IP/session alapú rate-limit finomhangolás.", ownerArea: "security", isRetryable: true },
  { code: "RELEASE_GATE_FAILED", category: "ops", severity: "high", httpStatus: 500, publicMessage: "A release gate nem engedte tovább a kiadást.", remediation: "Blockerek javítása és gate újrafuttatása.", ownerArea: "ops", isRetryable: false }
];

export async function ensureErrorTaxonomy(agencyId?: string | null) {
  const items = [];
  for (const item of defaultErrorTaxonomy) {
    items.push(await prisma.errorTaxonomyItem.upsert({
      where: { agencyId_code: { agencyId: agencyId ?? null, code: item.code } },
      update: item,
      create: { agencyId: agencyId ?? null, ...item }
    }));
  }
  return items;
}

export async function getErrorTaxonomySummary(agencyId?: string | null) {
  await ensureErrorTaxonomy(agencyId);
  const items = await prisma.errorTaxonomyItem.findMany({ where: { agencyId: agencyId ?? null }, orderBy: [{ severity: "asc" }, { category: "asc" }] });
  const high = items.filter((item) => item.severity === "high").length;
  const retryable = items.filter((item) => item.isRetryable).length;
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const score = Math.min(100, 55 + items.length * 3 + categories.length * 2 - Math.max(0, 10 - items.length) * 4);
  return { items, total: items.length, high, retryable, categories, score, status: items.length >= 10 ? "ready" : "needs_more_codes" };
}
