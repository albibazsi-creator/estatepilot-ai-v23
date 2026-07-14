import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getApiContractSummary } from "@/lib/api-contract";

export default async function ContractPage() {
  const { agency } = await getCurrentUser();
  const contract = await getApiContractSummary(agency.id);
  const paths = Object.keys((contract.spec as any).paths).sort();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Developer contract</p>
        <h1 className="text-3xl font-black">API Contract Center</h1>
        <p className="mt-2 text-slate-600">OpenAPI-szerű contract snapshot partner API-hoz, dashboardhoz és release gate-hez.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Route-ok" value={contract.routeCount} detail={`${contract.discoveredCount} felfedezett`} />
        <MetricCard label="Kézi coverage" value={`${contract.coverage}%`} detail={`${contract.manualCount} stabilan leírt route`} />
        <MetricCard label="Snapshot" value={contract.latest ? "van" : "nincs"} detail={contract.status} />
        <MetricCard label="Checksum" value={contract.checksum.slice(0, 8)} detail="sha256" />
      </div>
      <Card>
        <div className="flex items-center justify-between"><h2 className="text-xl font-black">Contract státusz</h2><StatusPill label={contract.status} tone={contract.status === "in_sync" ? "green" : contract.status === "changed_since_snapshot" ? "amber" : "red"} /></div>
        <p className="mt-2 text-sm text-slate-600">Menthető snapshot: <code className="rounded bg-slate-100 px-2 py-1">POST /api/contracts/openapi</code></p>
      </Card>
      <Card>
        <h2 className="text-xl font-black">API paths</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">{paths.slice(0, 120).map((p) => <code key={p} className="rounded-2xl border bg-slate-50 p-3 text-xs">{p}</code>)}</div>
      </Card>
    </div>
  );
}
