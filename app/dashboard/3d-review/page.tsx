import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { buildSpatialReviewQueue } from "@/lib/spatial-v19";

export default async function SpatialReviewPage() {
  const { agency } = await getCurrentUser();
  const data = await buildSpatialReviewQueue(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Human QA</p><h1 className="text-3xl font-black">3D Scene Review Queue</h1><p className="mt-2 text-slate-600">Publikálás előtti kötelező kézi ellenőrzés: manifest, minőség, disclosure és acceptance blocker alapján.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Review score" value={`${data.score}%`} detail={data.status} /><MetricCard label="Items" value={data.items.length} detail="QA feladat" /><MetricCard label="Manifest" value={data.validation.status} detail={`${data.validation.score}% strict score`} /></div>
      <Card><h2 className="text-xl font-black">Review itemek</h2><div className="mt-4 space-y-3">{data.items.map((item) => <div key={item.reviewKey} className="rounded-2xl border p-4 text-sm"><div className="flex items-center justify-between"><span className="font-black">{item.title}</span><StatusPill label={item.severity} tone={item.severity === "critical" ? "red" : item.severity === "high" ? "amber" : "blue"} /></div><p className="mt-1 text-slate-600">{item.description}</p></div>)}</div></Card>
    </div>
  );
}
