import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSellerReportSummary } from "@/lib/ai";
import { getCurrentUser } from "@/lib/current-user";
import { audit } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, agency } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, agencyId: agency.id },
    include: {
      leads: true,
      leadEvents: true,
      appointments: true,
      media: true
    }
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - 7);

  const weeklyEvents = listing.leadEvents.filter((e) => e.createdAt >= periodStart && e.createdAt <= periodEnd);
  const metrics = {
    pageViews: weeklyEvents.filter((e) => e.eventType === "page_view").length,
    galleryViews: weeklyEvents.filter((e) => e.eventType === "gallery_view").length,
    tourOpens: weeklyEvents.filter((e) => e.eventType === "tour_open").length,
    floorplanOpens: weeklyEvents.filter((e) => e.eventType === "floorplan_open").length,
    chatQuestions: weeklyEvents.filter((e) => e.eventType === "chat_question").length,
    leads: listing.leads.filter((l) => l.createdAt >= periodStart && l.createdAt <= periodEnd).length,
    hotLeads: listing.leads.filter((l) => l.leadScore >= 81).length,
    appointments: listing.appointments.filter((a) => a.createdAt >= periodStart && a.createdAt <= periodEnd).length,
    bestImage: listing.media.find((m) => m.isCover)?.roomLabel ?? listing.media[0]?.roomLabel ?? "nincs adat"
  };

  const ai = await generateSellerReportSummary({ listing, metrics, periodStart, periodEnd });
  const summary = typeof ai === "object" && ai && "summary" in ai ? String((ai as { summary?: unknown }).summary ?? "") : JSON.stringify(ai);

  const report = await prisma.sellerReport.create({
    data: {
      listingId: id,
      periodStart,
      periodEnd,
      metricsJson: { ...metrics, ai },
      aiSummary: summary,
      sellerEmail: listing.ownerReportEmail ?? listing.sellerEmail,
      shareToken: randomUUID(),
      status: "generated"
    }
  });
  await audit("seller_report_generated", "SellerReport", report.id, { listingId: id, shareToken: report.shareToken }, user.id);
  return NextResponse.json(report, { status: 201 });
}
