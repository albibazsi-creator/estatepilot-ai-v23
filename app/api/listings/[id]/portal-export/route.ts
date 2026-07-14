import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { portalExportSchema } from "@/lib/validators";
import { createPortalExport } from "@/lib/portal-export";
import { audit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, agency } = await getCurrentUser();
  const { id } = await params;
  const contentType = req.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await req.json().catch(() => ({}))
    : Object.fromEntries(await req.formData().catch(() => new FormData()));
  const parsed = portalExportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const listing = await prisma.listing.findFirst({ where: { id, agencyId: agency.id }, include: { media: true, tours: true, floorplans: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  const exportRecord = await createPortalExport({ agencyId: agency.id, listing, targetPortal: parsed.data.targetPortal, format: parsed.data.format, generatedById: user.id });
  await audit("portal_export_generated", "PortalExport", exportRecord.id, { listingId: id, targetPortal: parsed.data.targetPortal }, user.id);
  return NextResponse.json(exportRecord, { status: 201 });
}
