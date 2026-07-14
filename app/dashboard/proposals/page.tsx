import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";

export default async function ProposalsPage() {
  const { agency } = await getCurrentUser();
  const [proposals, hotLead] = await Promise.all([
    prisma.proposalDraft.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.lead.findFirst({ where: { listing: { agencyId: agency.id } }, orderBy: { leadScore: "desc" } })
  ]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">Proposal Draft Center</h1><p className="mt-1 text-slate-500">Hívási script, email draft és következő lépések forró leadekhez.</p></div>
        {hotLead ? <Button href="/api/proposals" variant="secondary">Proposal API</Button> : null}
      </div>
      <Card>
        <h2 className="text-xl font-black">Draftok</h2>
        <div className="mt-4 space-y-4">
          {proposals.map((p) => <div key={p.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-black">{p.title}</div><div className="text-sm text-slate-500">{p.subject}</div></div><StatusPill label={p.status} tone="amber" /></div><pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{p.bodyMarkdown}</pre>{p.callScript ? <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-white">{p.callScript}</pre> : null}</div>)}
          {proposals.length === 0 ? <p className="text-sm text-slate-500">Még nincs proposal draft. POST /api/proposals/generate leadId/listingId alapján.</p> : null}
        </div>
      </Card>
    </div>
  );
}
