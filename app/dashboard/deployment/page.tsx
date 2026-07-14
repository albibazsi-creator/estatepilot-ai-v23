import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getDeploymentReadiness } from "@/lib/deployment";

export default async function DeploymentPage() {
  const { agency } = await getCurrentUser();
  const summary = await getDeploymentReadiness(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Release operations</p><h1 className="text-3xl font-black">Deployment Environments</h1><p className="mt-2 text-slate-600">Local / staging / production gate-ek és release feltételek.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Deploy score" value={`${summary.score}%`} detail="environment readiness" /><MetricCard label="Ready" value={summary.ready} detail="környezet" /><MetricCard label="Blocked" value={summary.blocked} detail="blokkolt" /></div><div className="grid gap-4 md:grid-cols-3">{summary.environments.map((env) => <Card key={env.id}><div className="flex items-center justify-between"><h2 className="text-xl font-black">{env.name}</h2><StatusPill label={env.status} tone={env.status === "ready" ? "green" : env.status === "blocked" ? "red" : "amber"} /></div><p className="mt-2 text-sm text-slate-500">{env.url}</p><p className="mt-1 text-sm text-slate-500">Branch: {env.branch}</p><pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-3 text-xs text-white">{JSON.stringify(env.gatesJson, null, 2)}</pre></Card>)}</div></div>;
}
