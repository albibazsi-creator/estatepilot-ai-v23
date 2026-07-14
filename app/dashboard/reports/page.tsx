import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportSendButton } from "@/components/dashboard/report-actions";
import { formatDate } from "@/lib/format";

export default async function ReportsPage() {
  const { user } = await getCurrentUser();
  const reports = await prisma.sellerReport.findMany({
    where: { listing: { agentId: user.id } },
    include: { listing: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Seller riportok</h1>
        <p className="text-slate-500">Tulajdonosnak küldhető heti teljesítményriportok.</p>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="text-xl font-black">{report.listing.title}</div>
                <div className="mt-1 text-sm text-slate-500">{formatDate(report.periodStart)} – {formatDate(report.periodEnd)}</div>
                <p className="mt-4 leading-7 text-slate-700">{report.aiSummary}</p>
                {report.sentAt ? <p className="mt-2 text-sm font-semibold text-green-700">Elküldve: {formatDate(report.sentAt)}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button href={`/dashboard/listings/${report.listing.id}`} size="sm" variant="secondary">Listing</Button>
                <Button href={`/api/reports/${report.id}/export`} size="sm" variant="secondary">HTML export</Button>
                <ReportSendButton reportId={report.id} />
              </div>
            </div>
          </Card>
        ))}
        {!reports.length ? <Card><p className="text-slate-500">Még nincs riport. Nyiss meg egy listinget és generálj seller reportot.</p></Card> : null}
      </div>
    </div>
  );
}
