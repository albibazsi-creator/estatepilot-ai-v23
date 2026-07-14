import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { buildSpatialLineageMap } from "@/lib/spatial-v19";

export default async function SpatialLineagePage() {
  const { agency } = await getCurrentUser();
  const data = await buildSpatialLineageMap(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Asset lineage</p><h1 className="text-3xl font-black">3D Dataset Version + Lineage</h1><p className="mt-2 text-slate-600">Megmutatja, melyik feltöltött média hogyan kapcsolódik a 3D scene manifesthez és a későbbi viewerhez.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Lineage score" value={`${data.score}%`} detail={data.status} /><MetricCard label="Dataset" value={data.dataset.version} detail={data.dataset.datasetKey.slice(0, 18)} /><MetricCard label="Media" value={data.dataset.mediaCount} detail="input asset" /><MetricCard label="Scene" value={data.sceneId ? String(data.sceneId).slice(0, 12) : "pending"} detail="derived output" /></div>
      <Card><h2 className="text-xl font-black">Lineage minta</h2><div className="mt-4 space-y-2 text-sm">{data.lineage.slice(0, 12).map((item) => <div key={item.assetKey} className="rounded-2xl border p-3"><b>{item.sourceType}</b> → {item.derivedType}<p className="text-xs text-slate-500">{item.assetKey} / {item.checksum}</p></div>)}</div></Card>
    </div>
  );
}
