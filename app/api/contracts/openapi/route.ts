import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getApiContractSummary, saveApiContractSnapshot } from "@/lib/api-contract";

export async function GET() {
  const { agency } = await getCurrentUser();
  const summary = await getApiContractSummary(agency.id);
  return NextResponse.json({ status: summary.status, checksum: summary.checksum, routeCount: summary.routeCount, coverage: summary.coverage, spec: summary.spec });
}

export async function POST() {
  const { agency, user } = await getCurrentUser();
  const snapshot = await saveApiContractSnapshot(agency.id, user.email);
  return NextResponse.json({ ok: true, checksum: snapshot.checksum, routeCount: snapshot.routeCount, snapshotId: snapshot.snapshot.id });
}
