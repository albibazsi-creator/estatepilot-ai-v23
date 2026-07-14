import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/metric-card";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";

export default async function AdminPage() {
  const [users, agencies, listings, leads, aiOutputs, jobs, notifications, webhookEvents, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.agency.count(),
    prisma.listing.count(),
    prisma.lead.count(),
    prisma.aiOutput.count(),
    prisma.aiJob.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { agency: true, listing: true } }),
    prisma.notificationLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.webhookEvent.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Admin panel</h1>
        <p className="text-slate-500">SaaS-szintű MVP admin: user, agency, listing, lead, AI job, notification és audit log áttekintés.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Users" value={users} />
        <MetricCard label="Agencies" value={agencies} />
        <MetricCard label="Listings" value={listings} />
        <MetricCard label="Leads" value={leads} />
        <MetricCard label="AI outputs" value={aiOutputs} />
        <MetricCard label="Webhook" value={webhookEvents} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Legutóbbi AI jobok</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {jobs.map((job) => (
              <div key={job.id} className="py-3 text-sm">
                <div className="flex items-center justify-between gap-3"><b>{job.type}</b><StatusPill label={job.status} tone={job.status === "COMPLETED" ? "green" : job.status === "FAILED" ? "red" : job.status === "RUNNING" ? "blue" : "amber"} /></div>
                <div className="text-slate-500">{job.agency.name} • {job.listing?.title ?? "Agency szint"}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">Értesítési log</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className="py-3 text-sm">
                <div className="flex items-center justify-between gap-3"><b>{n.channel}: {n.to || "nincs címzett"}</b><StatusPill label={n.status} tone={n.status === "SENT" ? "green" : n.status === "FAILED" ? "red" : "amber"} /></div>
                <div className="text-slate-500">{n.subject ?? "–"}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-black">Audit log</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 text-sm">
              <b>{log.action}</b> • {log.entityType} • {log.entityId ?? "–"}
              <div className="text-slate-500">{log.createdAt.toISOString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
