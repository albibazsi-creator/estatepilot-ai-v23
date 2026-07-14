import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { featureFlagSchema } from "@/lib/validators";
import { upsertFeatureFlag } from "@/lib/features";

export async function GET() {
  const { agency } = await getCurrentUser();
  const flags = await prisma.featureFlag.findMany({ where: { OR: [{ agencyId: agency.id }, { agencyId: null }] }, orderBy: [{ key: "asc" }] });
  return NextResponse.json({ flags });
}

export async function POST(req: Request) {
  const { agency } = await getCurrentUser();
  const parsed = featureFlagSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const flag = await upsertFeatureFlag({ agencyId: agency.id, ...parsed.data });
  return NextResponse.json(flag, { status: 201 });
}
