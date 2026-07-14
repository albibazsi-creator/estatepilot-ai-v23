import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getSecretRotationSummary } from "@/lib/secret-rotation";

export default async function SecretsPage() {
  const { agency } = await getCurrentUser();
  const summary = await getSecretRotationSummary(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Secrets ops</p><h1 className="text-3xl font-black">Secret Rotation Center</h1><p className="mt-2 text-slate-600">Nem tárol secret értéket, csak konfigurációs és rotációs állapotot ellenőriz.</p></div><div className="grid gap-4 md:grid-cols-4"><MetricCard label="Score" value={`${summary.score}%`} detail="secret hygiene" /><MetricCard label="Configured" value={summary.configured} detail="secret" /><MetricCard label="Overdue" value={summary.overdue} detail="rotáció" /><MetricCard label="Total" value={summary.total} detail="secret" /></div><Card><div className="grid gap-3 md:grid-cols-2">{summary.items.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><b>{item.secretName}</b><StatusPill label={item.status} tone={item.status === "configured" ? "green" : "red"} /></div><p className="mt-1 text-sm text-slate-500">Provider: {item.provider} · rotation: {item.rotationDays} nap</p></div>)}</div></Card></div>;
}
