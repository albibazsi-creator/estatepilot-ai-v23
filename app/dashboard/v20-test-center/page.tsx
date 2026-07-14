import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getV20BuildPlan, getV20TestingReadiness } from "@/lib/v20-testing";

export default function V20TestCenterPage() {
  const readiness = getV20TestingReadiness();
  const buildPlan = getV20BuildPlan();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V20 test-ready release</p>
        <h1 className="text-3xl font-black">V20 Testing & QA Center</h1>
        <p className="mt-2 text-slate-600">Ez a nézet már nem új funkciót ígér, hanem a csomag tesztelhetőségét, core-flow állapotát és a következő futtatási parancsokat teszi egyértelművé.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="V20 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="API route" value={readiness.metrics.routes} detail="route.ts" />
        <MetricCard label="App page" value={readiness.metrics.pages} detail="page.tsx" />
        <MetricCard label="Prisma model" value={readiness.metrics.prismaModels} detail="schema models" />
      </div>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">V20 QA gate-ek</h2>
          <StatusPill label={readiness.blockers.length ? "blocked" : "ready"} tone={readiness.blockers.length ? "red" : "green"} />
        </div>
        <div className="mt-4 space-y-3">
          {readiness.gates.map((item) => (
            <div key={item.key} className="rounded-2xl border p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-black">{item.label}</span>
                <StatusPill label={item.status} tone={item.status === "passed" ? "green" : item.status === "warning" ? "amber" : "red"} />
              </div>
              <p className="mt-1 text-slate-600">{item.evidence}</p>
              <p className="mt-1 font-semibold">Score: {item.score}%</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Tesztelési sorrend</h2>
        <div className="mt-4 space-y-3 text-sm">
          {buildPlan.phases.map((phase) => (
            <div key={phase.phase} className="rounded-2xl border bg-slate-50 p-4">
              <p className="font-black">{phase.phase}</p>
              <code className="mt-2 block rounded-xl bg-slate-950 p-3 text-xs text-white">{phase.command}</code>
              <p className="mt-2 text-slate-600">{phase.expected}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Blokkolók</h2>
        {readiness.blockers.length ? <ul className="mt-3 space-y-2 text-sm text-red-700">{readiness.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}</ul> : <p className="mt-2 text-sm text-emerald-700">A no-dependency artifact QA nem talált kritikus blokkolót. A következő kapu a helyi npm install + build.</p>}
      </Card>
    </div>
  );
}
