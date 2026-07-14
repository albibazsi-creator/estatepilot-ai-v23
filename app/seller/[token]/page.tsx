import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export default async function SellerReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await prisma.sellerReport.findUnique({
    where: { shareToken: token },
    include: { listing: { include: { media: true, leads: true, appointments: true } } }
  });
  if (!report) notFound();

  const metrics = report.metricsJson as Record<string, unknown>;
  const cover = report.listing.media.find((m) => m.isCover) ?? report.listing.media[0];

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
          {cover ? <img src={cover.url} alt="" className="h-72 w-full object-cover opacity-80" /> : null}
          <div className="p-8">
            <div className="text-sm uppercase tracking-[0.3em] text-brand-gold">Tulajdonosi riport</div>
            <h1 className="mt-3 text-4xl font-black">{report.listing.title}</h1>
            <p className="mt-2 text-white/70">{formatDate(report.periodStart)} – {formatDate(report.periodEnd)}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Oldalmegtekintés" value={metrics.pageViews ?? metrics.page_view ?? 0} />
          <Metric label="Galéria" value={metrics.galleryViews ?? metrics.gallery_view ?? 0} />
          <Metric label="3D/360 túra" value={metrics.tourOpens ?? metrics.tour_open ?? 0} />
          <Metric label="Lead" value={metrics.leads ?? 0} />
        </div>

        <Card className="border-white/10 bg-white text-slate-950">
          <h2 className="text-2xl font-black">AI összefoglaló</h2>
          <p className="mt-3 leading-7 text-slate-700">{report.aiSummary}</p>
        </Card>

        <Card className="border-white/10 bg-white text-slate-950">
          <h2 className="text-2xl font-black">Részletes metrikák</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(metrics).filter(([key]) => key !== "ai").map(([key, value]) => (
              <div key={key} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{key}</div>
                <div className="mt-1 text-xl font-black">{typeof value === "object" ? JSON.stringify(value) : String(value)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-black">{String(value)}</div>
    </div>
  );
}
