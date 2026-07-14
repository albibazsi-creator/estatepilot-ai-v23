import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { buildDemoChecklist, buildDemoSteps } from "@/lib/demo-center";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DemoCenterPage() {
  const { agency } = await getCurrentUser();
  const runs = await prisma.demoRun.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
  const steps = buildDemoSteps();
  const checklist = buildDemoChecklist();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3"><div><h1 className="text-3xl font-black">Demo Center</h1><p className="mt-1 text-slate-500">Ügyfélnek mutatható 12 perces sales demo forgatókönyv.</p></div><Button href="/api/demo/runs" variant="secondary">Demo runs API</Button></div>
      <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <Card><h2 className="text-xl font-black">Demo script</h2><div className="mt-4 space-y-3">{steps.map((s) => <div key={s.step} className="rounded-2xl bg-slate-50 p-4"><div className="font-black">{s.step}. {s.title}</div><p className="mt-1 text-sm text-slate-600">{s.script}</p></div>)}</div></Card>
        <Card><h2 className="text-xl font-black">Checklist</h2><ul className="mt-4 space-y-2 text-sm text-slate-700">{checklist.map((c) => <li key={c} className="rounded-xl bg-emerald-50 px-3 py-2">✓ {c}</li>)}</ul></Card>
      </div>
      <Card><h2 className="text-xl font-black">Korábbi demo runok</h2><div className="mt-4 divide-y divide-slate-100">{runs.map((r) => <div key={r.id} className="flex items-center justify-between py-3"><div><div className="font-bold">{r.name}</div><div className="text-sm text-slate-500">{r.targetPersona}</div></div><div className="text-sm font-bold">{r.status}</div></div>)}</div></Card>
    </div>
  );
}
