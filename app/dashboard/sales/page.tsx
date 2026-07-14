import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function SalesPage() {
  const { agency } = await getCurrentUser();
  const [leads, tasks, appointments, payments] = await Promise.all([
    prisma.lead.findMany({ where: { listing: { agencyId: agency.id } }, include: { listing: true }, orderBy: { leadScore: "desc" }, take: 20 }),
    prisma.followUpTask.findMany({ where: { listing: { agencyId: agency.id }, status: "OPEN" }, orderBy: [{ priority: "desc" }, { dueAt: "asc" }], take: 20 }),
    prisma.appointment.findMany({ where: { listing: { agencyId: agency.id } }, include: { lead: true, listing: true }, orderBy: { startTime: "asc" }, take: 20 }),
    prisma.paymentRecord.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);
  const hotLeads = leads.filter((lead) => lead.leadScore >= 80).length;
  const expectedRevenue = payments.filter((p) => ["paid", "manual_pending", "created"].includes(p.status)).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Revenue workflow</p>
        <h1 className="text-3xl font-black">Sales cockpit</h1>
        <p className="mt-2 text-slate-600">A v7 célja, hogy a platform ne csak listinget kezeljen, hanem leadből időpontot, ajánlatot és bevételt vezessen végig.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border bg-white p-5"><p className="text-sm text-slate-500">Forró lead</p><p className="text-3xl font-black">{hotLeads}</p></div>
        <div className="rounded-3xl border bg-white p-5"><p className="text-sm text-slate-500">Nyitott task</p><p className="text-3xl font-black">{tasks.length}</p></div>
        <div className="rounded-3xl border bg-white p-5"><p className="text-sm text-slate-500">Időpont</p><p className="text-3xl font-black">{appointments.length}</p></div>
        <div className="rounded-3xl border bg-white p-5"><p className="text-sm text-slate-500">Pipeline érték</p><p className="text-3xl font-black">{expectedRevenue.toLocaleString("hu-HU")} Ft</p></div>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-6"><h2 className="text-xl font-black">Top leadek</h2><div className="mt-4 space-y-3">{leads.map((lead) => <div key={lead.id} className="rounded-2xl border p-4"><p className="font-bold">{lead.name} — {lead.leadScore}/100</p><p className="text-sm text-slate-500">{lead.listing.title}</p></div>)}</div></div>
        <div className="rounded-3xl border bg-white p-6"><h2 className="text-xl font-black">Mai teendők</h2><div className="mt-4 space-y-3">{tasks.map((task) => <div key={task.id} className="rounded-2xl border p-4"><p className="font-bold">{task.title}</p><p className="text-sm text-slate-500">Prioritás: {task.priority}</p></div>)}</div></div>
      </section>
    </div>
  );
}
