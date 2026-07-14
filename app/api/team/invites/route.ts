import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { guarded, parseJson } from "@/lib/api-response";

const schema = z.object({ email: z.string().email(), role: z.string().default("AGENT") });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return prisma.teamInvite.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { user, agency } = await getCurrentUser();
    const { data, error } = await parseJson(req, schema);
    if (error) return error;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return prisma.teamInvite.create({
      data: { agencyId: agency.id, email: data.email, role: data.role, invitedById: user.id, token: randomUUID(), expiresAt }
    });
  });
}
