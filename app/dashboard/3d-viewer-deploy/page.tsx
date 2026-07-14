import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { buildViewerDeploymentPlan } from "@/lib/spatial-v19";

export default async function ViewerDeployPage() {
  const { agency } = await getCurrentUser();
  const data = await buildViewerDeploymentPlan(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Viewer deployment</p><h1 className="text-3xl font-black">Tenant-safe 3D Viewer Deploy</h1><p className="mt-2 text-slate-600">A scene manifestet publikus, vízjelezett, disclosure-ös, tenant-safe spatial viewer linkké alakítja.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Deploy score" value={`${data.score}%`} detail={data.status} /><MetricCard label="Adapter" value={String(data.configJson.adapterKey)} detail="viewer" /><MetricCard label="Scene" value={data.configJson.sceneId} detail="scene id" /><MetricCard label="Security" value="tenant-safe" detail="watermark + noindex" /></div>
      <Card><h2 className="text-xl font-black">Viewer URL</h2><p className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm font-semibold">{data.url}</p></Card>
      <Card><h2 className="text-xl font-black">Embed snippet</h2><pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{data.embedSnippet}</pre></Card>
      <Card><h2 className="text-xl font-black">Adapterek</h2><div className="mt-4 space-y-2 text-sm">{data.adapters.map((adapter) => <div key={adapter.adapterKey} className="flex items-center justify-between rounded-2xl border p-3"><span className="font-semibold">{adapter.displayName}</span><StatusPill label={adapter.status} tone={["live", "dry_run"].includes(adapter.status) ? "green" : adapter.status === "blocked" ? "red" : "amber"} /></div>)}</div></Card>
    </div>
  );
}
