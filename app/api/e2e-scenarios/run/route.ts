import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getV14E2eSummary, runV14E2eScenarios } from "@/lib/e2e-scenarios-v14";

export async function GET() {
  const { agency } = await getCurrentUser();
  return NextResponse.json(await getV14E2eSummary(agency.id));
}

export async function POST() {
  const { agency, user } = await getCurrentUser();
  const runs = await runV14E2eScenarios(agency.id, user.email);
  return NextResponse.json({ ok: true, runs: runs.map((r) => ({ scenario: r.scenario.key, runId: r.run.id, status: r.status, score: r.score })) });
}
