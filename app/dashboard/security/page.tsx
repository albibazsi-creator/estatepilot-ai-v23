import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate } from "@/lib/format";

export default async function SecurityPage() {
  const { agency } = await getCurrentUser();
  const [notifications, webhooks, jobs] = await Promise.all([
    prisma.notificationLog.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.webhookEvent.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.aiJob.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Security / üzemeltetés</h1>
        <p className="mt-2 text-slate-500">Élesítés előtt itt kell látni az API kulcsokat, webhookokat, notification logot, jobokat és audit nyomokat.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card><div className="text-sm text-slate-500">Notification log</div><div className="mt-1 text-3xl font-black">{notifications.length}</div></Card>
        <Card><div className="text-sm text-slate-500">Webhook event</div><div className="mt-1 text-3xl font-black">{webhooks.length}</div></Card>
        <Card><div className="text-sm text-slate-500">AI job minta</div><div className="mt-1 text-3xl font-black">{jobs.length}</div></Card>
      </div>
      <Card>
        <h2 className="text-xl font-black">Legutóbbi AI jobok</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {jobs.map((job) => <div key={job.id} className="py-3 text-sm"><b>{job.type}</b> • {job.status} • {formatDate(job.createdAt)}</div>)}
        </div>
      </Card>
      <Card className="bg-slate-950 text-white">
        <h2 className="text-xl font-black">Éles security checklist</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/75">
          <li>Clerk/Auth.js session lookup + role based data scoping</li>
          <li>API key scope ellenőrzés minden partner endpointon</li>
          <li>Rate limit Redis-szel, nem memóriában</li>
          <li>Sentry error tracking + PostHog product analytics</li>
          <li>R2/S3 privát bucket, presigned upload, vírus/mime ellenőrzés</li>
        </ul>
      </Card>
    </div>
  );
}
