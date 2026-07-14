import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getProductionAdapterSummary, syncProductionAdapters } from "@/lib/production-adapters";

export async function GET() {
  const { agency } = await getCurrentUser();
  return NextResponse.json(await getProductionAdapterSummary(agency.id));
}

export async function POST() {
  const { agency } = await getCurrentUser();
  const adapters = await syncProductionAdapters(agency.id);
  return NextResponse.json({ ok: true, adapters });
}
