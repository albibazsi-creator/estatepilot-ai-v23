import { prisma } from "@/lib/prisma";
import { renderPseudoPdfBuffer, renderSellerReportHtml } from "@/lib/pdf";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await prisma.sellerReport.findUnique({ where: { id }, include: { listing: true } });
  if (!report) return new Response("Report not found", { status: 404 });
  const html = renderSellerReportHtml({
    title: report.listing.title,
    period: `${report.periodStart.toISOString().slice(0, 10)} - ${report.periodEnd.toISOString().slice(0, 10)}`,
    summary: report.aiSummary,
    metrics: report.metricsJson as Record<string, unknown>
  });
  const buffer = renderPseudoPdfBuffer(html);
  return new Response(buffer, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `attachment; filename="seller-report-${report.id}.html"`
    }
  });
}
