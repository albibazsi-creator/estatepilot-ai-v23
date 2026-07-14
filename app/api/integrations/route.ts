import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const { agency } = await getCurrentUser();
  const integrations = await prisma.integration.findMany({ where: { agencyId: agency.id }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(integrations);
}

export async function POST(req: Request) {
  const { agency } = await getCurrentUser();
  const body = await req.json();
  if (!body.provider || !body.type) return NextResponse.json({ error: "provider and type required" }, { status: 400 });

  const integration = await prisma.integration.upsert({
    where: { agencyId_provider_type: { agencyId: agency.id, provider: String(body.provider), type: String(body.type) } },
    update: { status: String(body.status ?? "mock"), configJson: body.configJson ?? undefined, connectedAt: body.connectedAt ? new Date(body.connectedAt) : new Date() },
    create: { agencyId: agency.id, provider: String(body.provider), type: String(body.type), status: String(body.status ?? "mock"), configJson: body.configJson ?? undefined, connectedAt: new Date() }
  });

  return NextResponse.json(integration, { status: 201 });
}
