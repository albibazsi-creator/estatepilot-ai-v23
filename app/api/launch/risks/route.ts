import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getLaunchRiskSummary, syncLaunchRisks } from "@/lib/launch-risks-v14";

export async function GET() {
  const { agency } = await getCurrentUser();
  return NextResponse.json(await getLaunchRiskSummary(agency.id));
}

export async function POST() {
  const { agency } = await getCurrentUser();
  return NextResponse.json(await syncLaunchRisks(agency.id));
}
