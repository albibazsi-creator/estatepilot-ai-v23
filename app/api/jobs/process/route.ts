import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { processNextJob, runJob } from "@/lib/jobs";

export async function POST(req: Request) {
  const { agency } = await getCurrentUser();
  const body = await req.json().catch(() => ({}));
  const job = body.jobId ? await runJob(String(body.jobId)) : await processNextJob(agency.id);
  if (!job) return NextResponse.json({ ok: true, message: "No pending jobs" });
  return NextResponse.json(job);
}
