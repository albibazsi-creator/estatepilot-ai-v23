import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { createPlainApiKey, apiKeyPrefix, hashApiKey, redactApiKey } from "@/lib/api-keys";
import { guarded, parseJson } from "@/lib/api-response";
import { audit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  scopes: z.array(z.string()).default(["listings:read", "leads:read"])
});

export async function GET() {
  return guarded(async () => {
    const { agency } = await requireRole("AGENCY_OWNER");
    const keys = await prisma.apiKey.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
    return keys.map((key) => ({ id: key.id, name: key.name, prefix: key.prefix, scopes: key.scopes, revokedAt: key.revokedAt, lastUsedAt: key.lastUsedAt, createdAt: key.createdAt }));
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { user, agency } = await requireRole("AGENCY_OWNER");
    const parsed = await parseJson(req, createSchema);
    if (parsed.error) return parsed.error;
    const plainKey = createPlainApiKey();
    const prefix = apiKeyPrefix(plainKey);
    const apiKey = await prisma.apiKey.create({
      data: {
        agencyId: agency.id,
        name: parsed.data!.name,
        scopes: parsed.data!.scopes,
        prefix,
        keyHash: hashApiKey(plainKey)
      }
    });
    await audit("api_key_created", "ApiKey", apiKey.id, { prefix, scopes: parsed.data!.scopes, redacted: redactApiKey(plainKey) }, user.id);
    return { id: apiKey.id, name: apiKey.name, prefix: apiKey.prefix, scopes: apiKey.scopes, plainKey, warning: "Ezt a kulcsot csak most mutatjuk meg. Mentsd el biztonságosan." };
  });
}
