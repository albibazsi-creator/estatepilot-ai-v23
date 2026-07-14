import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { runV13ReleaseGates } from "@/lib/release-gates-v13";

export async function POST() {
  const { agency, user } = await getCurrentUser();
  const result = await runV13ReleaseGates(agency.id, user.email);
  return NextResponse.json({ ok: true, status: result.status, score: result.score, failed: result.failed, runId: result.run.id });
}
