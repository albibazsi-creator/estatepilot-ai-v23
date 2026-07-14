import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { jobSchema } from "@/lib/validators";
import { enqueueJob } from "@/lib/jobs";
import { audit } from "@/lib/audit";

export async function GET() {
  const { agency } = await getCurrentUser();
  const jobs = await prisma.aiJob.findMany({
    where: { agencyId: agency.id },
    include: { listing: { select: { id: true, title: true, slug: true } } },
    orderBy: [{ createdAt: "desc" }],
    take: 100
  });
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const { user, agency } = await getCurrentUser();
  const body = await req.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.listingId) {
    const listing = await prisma.listing.findFirst({ where: { id: parsed.data.listingId, agencyId: agency.id }, select: { id: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const job = await enqueueJob({
    agencyId: agency.id,
    listingId: parsed.data.listingId,
    type: parsed.data.type,
    priority: parsed.data.priority,
    payload: parsed.data.payload as object | null | undefined
  });
  await audit("job_enqueued", "AiJob", job.id, { type: job.type, listingId: job.listingId }, user.id);
  return NextResponse.json(job, { status: 201 });
}
