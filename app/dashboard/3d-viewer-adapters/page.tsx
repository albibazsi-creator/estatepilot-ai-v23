import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";
import { getViewerAdapters } from "@/lib/spatial-v17";

export default function ThreeDViewerAdaptersPage() {
  const adapters = getViewerAdapters();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D viewer adapterek</p>
        <h1 className="text-3xl font-black">Viewer Adapter Center</h1>
        <p className="mt-2 text-slate-600">Választható viewer stratégia saját WebGL shellhez, SuperSplat/PlayCanvas embedhez vagy Matterport fallbackhez.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {adapters.map((adapter) => <Card key={adapter.adapterKey}><div className="flex items-center justify-between"><h2 className="font-black">{adapter.displayName}</h2><StatusPill label={adapter.status} tone={adapter.status === "live" ? "green" : adapter.status === "dry_run" ? "amber" : "red"} /></div><p className="mt-3 text-sm text-slate-600">{adapter.notes}</p><div className="mt-4 flex flex-wrap gap-2">{adapter.supportedFormats.map((format) => <StatusPill key={format} label={format} tone="blue" />)}</div></Card>)}
      </div>
    </div>
  );
}
