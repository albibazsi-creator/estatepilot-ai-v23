import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";
import { GenerateLeadTasksButton, TaskStatusButton } from "@/components/dashboard/follow-up-actions";

export default async function FollowUpsPage() {
  const { user, agency } = await getCurrentUser();
  const [tasks, leads] = await Promise.all([
    prisma.followUpTask.findMany({
      where: { OR: [{ assignedUserId: user.id }, { listing: { agencyId: agency.id } }] },
      include: { listing: true, lead: true },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueAt: "asc" }]
    }),
    prisma.lead.findMany({ where: { listing: { agencyId: agency.id } }, include: { listing: true }, orderBy: { leadScore: "desc" }, take: 8 })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Follow-up taskok</h1>
        <p className="text-slate-500">A lead scoringból automatikusan keletkező napi értékesítési teendők.</p>
      </div>

      <Card>
        <h2 className="text-xl font-black">Task generálás leadekből</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="font-bold">{lead.name} • {lead.leadScore}/100</div>
              <div className="text-sm text-slate-500">{lead.listing.title}</div>
              <div className="mt-3"><GenerateLeadTasksButton leadId={lead.id} /></div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black">{task.title}</h2>
                  <StatusPill label={task.status} tone={task.status === "DONE" ? "green" : task.priority >= 80 ? "red" : "amber"} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{task.description}</p>
                <p className="mt-2 text-xs text-slate-500">Prioritás: {task.priority}/100 • Határidő: {task.dueAt ? formatDate(task.dueAt) : "nincs"} • Listing: {task.listing?.title ?? "–"}</p>
              </div>
              <div className="flex gap-2">
                {task.status !== "DONE" ? <TaskStatusButton taskId={task.id} status="DONE" label="Kész" /> : null}
                {task.status === "OPEN" ? <TaskStatusButton taskId={task.id} status="SNOOZED" label="Szundi" /> : null}
                {task.leadId ? <Button href={`/dashboard/leads/${task.leadId}`} size="sm">Lead</Button> : null}
              </div>
            </div>
          </Card>
        ))}
        {tasks.length === 0 ? <Card><p className="text-sm text-slate-500">Még nincs follow-up task. Generálj taskokat a forró leadekből.</p></Card> : null}
      </div>
    </div>
  );
}
