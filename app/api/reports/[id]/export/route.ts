import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { escapeHtml } from "@/lib/sanitize";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await prisma.sellerReport.findUnique({ where: { id }, include: { listing: true } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const metrics = report.metricsJson as Record<string, unknown>;
  const metricRows = Object.entries(metrics)
    .filter(([key]) => key !== "ai")
    .map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(typeof value === "object" ? JSON.stringify(value) : value)}</td></tr>`)
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Seller report</title><style>body{font-family:Arial;padding:40px;color:#0f172a;background:#f8fafc}.wrap{max-width:900px;margin:auto}.card{background:white;border:1px solid #e2e8f0;border-radius:24px;padding:24px;margin:16px 0}table{width:100%;border-collapse:collapse}td{padding:10px;border-bottom:1px solid #e2e8f0}</style></head><body><main class="wrap"><h1>${escapeHtml(report.listing.title)}</h1><p>${escapeHtml(formatDate(report.periodStart))} – ${escapeHtml(formatDate(report.periodEnd))}</p><div class="card"><h2>AI összefoglaló</h2><p>${escapeHtml(report.aiSummary)}</p></div><div class="card"><h2>Metrikák</h2><table>${metricRows}</table></div></main></body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="seller-report-${id}.html"`
    }
  });
}
