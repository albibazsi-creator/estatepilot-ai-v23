import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getLatestTenantBoundaryChecks, runTenantBoundaryAudit } from "@/lib/tenant-boundary";

export default async function TenantBoundaryPage() {
  const { agency } = await getCurrentUser();
  const existing = await getLatestTenantBoundaryChecks(agency.id);
  const result = existing.length ? { score: 100 - existing.filter((c) => c.status !== "passed").length * 15, checks: existing } : await runTenantBoundaryAudit(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 tenant isolation</p><h1 className="text-3xl font-black">Tenant Boundary Audit</h1><p className="mt-2 text-slate-600">Agency-scope, lead/report hozzáférés és partner API izoláció ellenőrzése.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Boundary score" value={`${Math.max(0, result.score)}%`} detail="soft demo audit" /><MetricCard label="Checks" value={result.checks.length} detail="utolsó audit" /><MetricCard label="Warnings" value={result.checks.filter((c) => c.status !== "passed").length} detail="javítandó" /></div><Card><div className="space-y-3">{result.checks.map((check) => <div key={`${check.checkType}-${check.createdAt ?? "new"}`} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><p className="font-black">{check.checkType}</p><StatusPill status={check.status} /></div><p className="mt-2 text-sm text-slate-600">{check.summary}</p>{check.remediation ? <p className="mt-2 text-xs font-semibold text-amber-700">Javítás: {check.remediation}</p> : null}</div>)}</div></Card></div>;
}
