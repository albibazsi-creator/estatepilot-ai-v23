import { getCurrentUser } from "@/lib/current-user";
import { calculateHandoffScore } from "@/lib/handoff";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";

export default async function HandoffPage() {
  const { agency } = await getCurrentUser();
  const handoff = await calculateHandoffScore(agency.id);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black">Developer Handoff Score</h1><p className="mt-1 text-slate-500">Átadási állapot: demó adatok, workflow-k, integrációs skeletonok és dokumentációk.</p></div>
      <Card className="bg-slate-950 text-white"><div className="text-sm text-white/60">Handoff score</div><div className="mt-2 text-6xl font-black">{handoff.score}/90</div><p className="mt-2 text-white/70">Ez nem production readiness, hanem fejlesztői átadhatóság és demo-teljesség indikátor.</p></Card>
      <div className="grid gap-4 md:grid-cols-2">
        {handoff.checks.map((check) => <Card key={check.key} className="flex items-center justify-between"><div><div className="font-bold">{check.key}</div><div className="text-sm text-slate-500">Súly: {check.weight}</div></div><StatusPill label={check.ok ? "OK" : "HIÁNY"} tone={check.ok ? "green" : "red"} /></Card>)}
      </div>
      <Card><h2 className="text-xl font-black">Counts</h2><pre className="mt-4 overflow-auto rounded-2xl bg-slate-50 p-4 text-sm">{JSON.stringify(handoff.counts, null, 2)}</pre></Card>
    </div>
  );
}
