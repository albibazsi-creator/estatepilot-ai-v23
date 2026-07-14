import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { ensureRetentionPolicies } from "@/lib/data-retention";

export default async function RetentionPage() {
  const { agency } = await getCurrentUser();
  const policies = await ensureRetentionPolicies(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 data retention</p><h1 className="text-3xl font-black">Adatmegőrzési policy</h1><p className="mt-2 text-slate-600">Lead, chat, audit és AI trace retention szabályok GDPR/DSR működéshez.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Policies" value={policies.length} detail="aktív kategória" /><MetricCard label="Longest retention" value={`${Math.max(...policies.map((p) => p.retentionDays))} nap`} detail="audit/legal" /><MetricCard label="Mode" value="dry-run first" detail="biztonságos törlés" /></div><Card><div className="space-y-3">{policies.map((p) => <div key={p.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><p className="font-black">{p.dataCategory}</p><StatusPill status={p.status} /></div><p className="mt-2 text-sm text-slate-600">{p.retentionDays} nap • {p.legalBasis} • action: {p.action}</p>{p.notes ? <p className="mt-1 text-xs text-slate-500">{p.notes}</p> : null}</div>)}</div></Card></div>;
}
