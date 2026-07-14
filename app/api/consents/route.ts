import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { consentSchema } from "@/lib/validators";
import { recordConsent } from "@/lib/consent";
import { getClientIp } from "@/lib/rate-limit";

export async function GET() {
  const { agency } = await getCurrentUser();
  const consents = await prisma.consentRecord.findMany({ where: { agencyId: agency.id }, orderBy: { acceptedAt: "desc" }, take: 100 });
  return NextResponse.json({ consents });
}

export async function POST(req: Request) {
  const { agency } = await getCurrentUser();
  const parsed = consentSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const consent = await recordConsent({ ...parsed.data, agencyId: agency.id, ip: getClientIp(req), userAgent: req.headers.get("user-agent") });
  return NextResponse.json(consent, { status: 201 });
}
