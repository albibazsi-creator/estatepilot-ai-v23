import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { buildReconstructionDispatchPayload } from "@/lib/spatial-v18";

export default async function ThreeDReconstructionPage() {
  const { agency } = await getCurrentUser();
  const payload = await buildReconstructionDispatchPayload(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D reconstruction dispatch</p>
        <h1 className="text-3xl font-black">Gaussian Splatting Dispatch Contract</h1>
        <p className="mt-2 text-slate-600">Ez a payload mehet külső 3D providerhez vagy saját GPU workerhez. Tartalmazza az input bundle-t, acceptance kritériumokat és compliance szabályokat.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Mode" value={payload.mode} detail={payload.contractVersion} />
        <MetricCard label="Images" value={payload.inputBundle.images.length} detail="3D input fotó" />
        <MetricCard label="Videos" value={payload.inputBundle.videos.length} detail="walkthrough videó" />
        <MetricCard label="Checksum" value={payload.checksum.slice(0, 8)} detail="payload integrity" />
      </div>
      <Card>
        <h2 className="text-xl font-black">Capture warningok</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {payload.captureWarnings.length ? payload.captureWarnings.map((warning) => <StatusPill key={warning} label={warning} tone="amber" />) : <StatusPill label="Input bundle rendben" tone="green" />}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Provider routing</h2>
        <div className="mt-4 space-y-2 text-sm">
          {payload.providerRouting.providers.map((provider) => <div key={provider.key} className="flex items-center justify-between rounded-2xl border p-3"><span className="font-semibold">{provider.key}</span><StatusPill label={provider.status} tone={provider.status === "live" ? "green" : provider.status === "partial" ? "amber" : "red"} /></div>)}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Worker payload preview</h2>
        <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(payload, null, 2)}</pre>
      </Card>
    </div>
  );
}
