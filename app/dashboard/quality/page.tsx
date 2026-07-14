import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const severityLabel: Record<string, string> = { critical: "Kritikus", warning: "Figyelmeztetés", info: "Info" };

export default async function QualityPage() {
  const { agency } = await getCurrentUser();
  const [issues, listings] = await Promise.all([
    prisma.dataQualityIssue.findMany({ where: { agencyId: agency.id, status: "open" }, orderBy: [{ severity: "asc" }, { createdAt: "desc" }], take: 80 }),
    prisma.listing.findMany({ where: { agencyId: agency.id }, select: { id: true, title: true, aiReadinessScore: true }, orderBy: { updatedAt: "desc" } })
  ]);
  const critical = issues.filter((issue) => issue.severity === "critical").length;
  const warning = issues.filter((issue) => issue.severity === "warning").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">v7 Quality Control</p>
        <h1 className="text-3xl font-black">Data quality központ</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Ez a rész az élesítéshez kell: megmutatja, melyik ingatlan publikálható, hol hiányzik adat, kép, alaprajz, tour vagy disclosure.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5"><p className="text-sm text-slate-500">Nyitott issue</p><p className="text-3xl font-black">{issues.length}</p></div>
        <div className="rounded-3xl border bg-white p-5"><p className="text-sm text-slate-500">Kritikus</p><p className="text-3xl font-black">{critical}</p></div>
        <div className="rounded-3xl border bg-white p-5"><p className="text-sm text-slate-500">Warning</p><p className="text-3xl font-black">{warning}</p></div>
      </div>

      <section className="rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-black">Listing audit futtatás</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {listings.map((listing) => (
            <form key={listing.id} action={`/api/listings/${listing.id}/data-quality`} method="post" className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <Link className="font-bold hover:underline" href={`/dashboard/listings/${listing.id}`}>{listing.title}</Link>
                <p className="text-sm text-slate-500">Readiness: {listing.aiReadinessScore}/100</p>
              </div>
              <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Audit</button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-black">Nyitott hibák</h2>
        <div className="mt-4 space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{severityLabel[issue.severity] ?? issue.severity}</span><span className="text-xs text-slate-500">{issue.code}</span></div>
              <p className="mt-2 font-bold">{issue.title}</p>
              <p className="text-sm text-slate-600">{issue.description}</p>
              {issue.suggestedFix ? <p className="mt-2 text-sm font-semibold text-slate-800">Javítás: {issue.suggestedFix}</p> : null}
            </div>
          ))}
          {!issues.length ? <p className="text-slate-500">Nincs nyitott issue. Futtass auditot egy listingen.</p> : null}
        </div>
      </section>
    </div>
  );
}
