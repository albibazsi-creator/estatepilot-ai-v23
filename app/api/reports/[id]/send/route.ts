import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTrackedEmail } from "@/lib/notifications";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate } from "@/lib/format";
import { env } from "@/lib/env";
import { escapeHtml } from "@/lib/sanitize";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, agency } = await getCurrentUser();
  const { id } = await params;
  const report = await prisma.sellerReport.findUnique({
    where: { id },
    include: { listing: { include: { agent: true } } }
  });
  if (!report || report.listing.agencyId !== agency.id) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const sellerEmail = report.sellerEmail ?? report.listing.ownerReportEmail ?? report.listing.sellerEmail ?? report.listing.agent.email;
  const shareUrl = report.shareToken ? `${env.NEXT_PUBLIC_APP_URL}/seller/${report.shareToken}` : undefined;
  const email = await sendTrackedEmail({
    agencyId: report.listing.agencyId,
    listingId: report.listingId,
    to: sellerEmail,
    subject: `Heti tulajdonosi riport – ${report.listing.title}`,
    html: `
      <h1>${escapeHtml(report.listing.title)}</h1>
      <p>${escapeHtml(formatDate(report.periodStart))} – ${escapeHtml(formatDate(report.periodEnd))}</p>
      <h2>AI összefoglaló</h2>
      <p>${escapeHtml(report.aiSummary)}</p>
      ${shareUrl ? `<p><a href="${escapeHtml(shareUrl)}">Riport megnyitása</a></p>` : ""}
      <h2>Metrikák</h2>
      <pre>${escapeHtml(JSON.stringify(report.metricsJson, null, 2))}</pre>
    `
  });

  const updated = await prisma.sellerReport.update({ where: { id }, data: { sentAt: new Date(), status: "sent" } });
  await audit("seller_report_sent", "SellerReport", report.id, { email }, user.id);
  return NextResponse.json({ report: updated, email });
}
