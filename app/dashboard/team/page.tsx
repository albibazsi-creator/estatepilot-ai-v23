import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";

export default async function TeamPage() {
  const { agency } = await getCurrentUser();
  const [members, invites] = await Promise.all([
    prisma.agencyMember.findMany({ where: { agencyId: agency.id }, include: { user: true }, orderBy: { createdAt: "asc" } }),
    prisma.teamInvite.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } })
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-black">Agency Team OS</h1><p className="mt-1 text-slate-500">Csapattagok, meghívók és szerepkörök az irodai működéshez.</p></div>
        <Button href="/api/team/invites" variant="secondary">Invite API</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><div className="text-sm text-slate-500">Tagok</div><div className="mt-2 text-3xl font-black">{members.length}</div></Card>
        <Card><div className="text-sm text-slate-500">Függő meghívók</div><div className="mt-2 text-3xl font-black">{invites.filter(i => i.status === "pending").length}</div></Card>
        <Card><div className="text-sm text-slate-500">Irodai csomag</div><div className="mt-2 text-2xl font-black">{agency.subscriptionPlan}</div></Card>
      </div>
      <Card>
        <h2 className="text-xl font-black">Csapat</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {members.map((member) => <div key={member.id} className="flex items-center justify-between py-4"><div><div className="font-bold">{member.user.name}</div><div className="text-sm text-slate-500">{member.user.email}</div></div><StatusPill label={member.role} tone="blue" /></div>)}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Meghívók</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {invites.map((invite) => <div key={invite.id} className="flex items-center justify-between py-4"><div><div className="font-bold">{invite.email}</div><div className="text-sm text-slate-500">{invite.role} • token: {invite.token.slice(0, 8)}…</div></div><StatusPill label={invite.status} tone={invite.status === "pending" ? "amber" : "green"} /></div>)}
          {invites.length === 0 ? <p className="text-sm text-slate-500">Még nincs meghívó.</p> : null}
        </div>
      </Card>
    </div>
  );
}
