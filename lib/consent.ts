import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export const CONSENT_TEXTS = {
  lead_capture: "Hozzájárulok, hogy az ingatlanos az általam megadott adatokat a megkeresésem kezelése és időpont-egyeztetés céljából kezelje.",
  marketing_followup: "Hozzájárulok, hogy az ingatlanos az érdeklődésemmel kapcsolatos utánkövető üzenetet küldjön.",
  seller_report: "Hozzájárulok, hogy a tulajdonosi riportban összesített, személyes adatot nem tartalmazó aktivitási adatok szerepeljenek."
} as const;

export function hashIp(ip?: string | null) {
  if (!ip || ip === "unknown") return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 48);
}

export async function recordConsent(input: {
  agencyId?: string | null;
  listingId?: string | null;
  leadId?: string | null;
  purpose: string;
  subjectEmail?: string | null;
  subjectPhone?: string | null;
  source: string;
  ip?: string | null;
  userAgent?: string | null;
  consentText?: string;
  metadataJson?: Record<string, unknown> | null;
}) {
  return prisma.consentRecord.create({
    data: {
      agencyId: input.agencyId ?? null,
      listingId: input.listingId ?? null,
      leadId: input.leadId ?? null,
      purpose: input.purpose,
      subjectEmail: input.subjectEmail ?? null,
      subjectPhone: input.subjectPhone ?? null,
      source: input.source,
      ipHash: hashIp(input.ip),
      userAgent: input.userAgent?.slice(0, 300) ?? null,
      consentText: input.consentText ?? CONSENT_TEXTS.lead_capture,
      metadataJson: input.metadataJson ?? undefined
    }
  });
}
