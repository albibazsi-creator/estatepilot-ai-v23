import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getCorePilotStatus, runCorePilotFlow } from "@/lib/core-pilot-flow";

export async function GET() {
  const { agency } = await getCurrentUser();
  return NextResponse.json(await getCorePilotStatus(agency.id));
}

export async function POST() {
  const { agency, user } = await getCurrentUser();
  const result = await runCorePilotFlow(agency.id, user.email);
  return NextResponse.json({ ok: true, runId: result.run.id, score: result.score, status: result.status, failed: result.failed, warnings: result.warnings });
}
