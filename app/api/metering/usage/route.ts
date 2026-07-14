import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { getUsageMeteringSummary, recordUsage } from "@/lib/usage-metering";

const usageSchema = z.object({
  featureKey: z.string().min(2),
  quantity: z.number().int().positive().default(1),
  unit: z.string().default("event"),
  estimatedCostHuf: z.number().int().min(0).default(0),
  listingId: z.string().optional(),
  leadId: z.string().optional(),
  metadataJson: z.any().optional()
});

export async function GET() {
  const { agency } = await getCurrentUser();
  return NextResponse.json(await getUsageMeteringSummary(agency.id));
}

export async function POST(request: NextRequest) {
  const { agency } = await getCurrentUser();
  const input = usageSchema.parse(await request.json());
  const record = await recordUsage({ agencyId: agency.id, ...input, source: "api" });
  return NextResponse.json({ ok: true, record });
}
