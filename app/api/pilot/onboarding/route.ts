import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getPilotOnboardingSummary } from "@/lib/pilot-onboarding";

export async function GET() {
  const { agency } = await getCurrentUser();
  return NextResponse.json(await getPilotOnboardingSummary(agency.id));
}
