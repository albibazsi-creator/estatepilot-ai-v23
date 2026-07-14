import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnqueueJobButton, ProcessJobButton } from "@/components/dashboard/job-actions";
import { StatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";

const jobLabels: Record<string, string> = {
  analyze_images: "AI képelemzés",
  generate_listing_bundle: "Listing marketing bundle",
  generate_seller_report: "Seller report",
  recalculate_leads: "Lead score újraszámítás",
  daily_manager: "Napi AI manager",
  staging_plan: "Staging terv",
  generate_campaign_plan: "AI kampányterv",
  create_followup_tasks: "Follow-up taskok",
  rebuild_property_knowledge: "Property knowledge base"
};

export default async function AutomationPage() {
  const { agency } = await getCurrentUser();
  const [jobs, listings] = await Promise.all([
    prisma.aiJob.findMany({ where: { agencyId: agency.id }, include: { listing: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.listing.findMany({ where: { agencyId: agency.id }, orderBy: { updatedAt: "desc" }, take: 20 })
  ]);

  const pending = jobs.filter((j) => j.status === "PENDING").length;
  const failed = jobs.filter((j) => j.status === "FAILED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">AI automatizáció</h1>
          <p className="mt-1 text-slate-500">Queue, background workflow-k és kézi futtatás MVP környezetben.</p>
        </div>
        <ProcessJobButton label="Következő job futtatása" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><div className="text-sm text-slate-500">Összes job</div><div className="mt-2 text-3xl font-black">{jobs.length}</div></Card>
        <Card><div className="text-sm text-slate-500">Várakozik</div><div className="mt-2 text-3xl font-black">{pending}</div></Card>
        <Card><div className="text-sm text-slate-500">Hibás</div><div className="mt-2 text-3xl font-black">{failed}</div></Card>
      </div>

      <Card>
        <h2 className="text-xl font-black">Gyors workflow indítás</h2>
        <p className="mt-1 text-sm text-slate-500">Válassz ingatlant, majd rakd sorba a teljes AI csomagot vagy egy részfeladatot.</p>
        <div className="mt-4 space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
              <div>
                <div className="font-bold">{listing.title}</div>
                <div className="text-sm text-slate-500">{listing.city} • readiness: {listing.aiReadinessScore}/100</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <EnqueueJobButton listingId={listing.id} type="analyze_images" label="Képek elemzése" />
                <EnqueueJobButton listingId={listing.id} type="generate_listing_bundle" label="Marketing bundle" />
                <EnqueueJobButton listingId={listing.id} type="staging_plan" label="Staging terv" />
                <EnqueueJobButton listingId={listing.id} type="generate_campaign_plan" label="Kampányterv" />
                <EnqueueJobButton listingId={listing.id} type="create_followup_tasks" label="Follow-up task" />
                <EnqueueJobButton listingId={listing.id} type="rebuild_property_knowledge" label="Knowledge base" />
                <EnqueueJobButton listingId={listing.id} type="generate_seller_report" label="Riport" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Job queue</h2>
          <Button href="/api/jobs" variant="secondary" size="sm">JSON</Button>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="p-3">Típus</th><th className="p-3">Ingatlan</th><th className="p-3">Státusz</th><th className="p-3">Prio</th><th className="p-3">Létrehozva</th><th className="p-3">Akció</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="p-3 font-bold">{jobLabels[job.type] ?? job.type}</td>
                  <td className="p-3 text-slate-600">{job.listing?.title ?? "Agency szint"}</td>
                  <td className="p-3"><StatusPill label={job.status} tone={job.status === "COMPLETED" ? "green" : job.status === "FAILED" ? "red" : job.status === "RUNNING" ? "blue" : "amber"} /></td>
                  <td className="p-3">{job.priority}</td>
                  <td className="p-3 text-slate-500">{formatDate(job.createdAt)}</td>
                  <td className="p-3">{job.status === "PENDING" || job.status === "FAILED" ? <ProcessJobButton jobId={job.id} /> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
