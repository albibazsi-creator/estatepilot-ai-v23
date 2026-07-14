import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getSceneManifestSummary } from "@/lib/spatial-v17";

export default async function ThreeDScenesPage() {
  const { agency } = await getCurrentUser();
  const summary = await getSceneManifestSummary(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D scene registry</p>
        <h1 className="text-3xl font-black">Scene Manifest Center</h1>
        <p className="mt-2 text-slate-600">A worker kimeneteiből létrejövő .splat/.ply/.ksplat scene-ek, manifestek és publikus viewer linkek.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Scenes" value={summary.scenes.length} detail={`${summary.readyScenes} ready`} />
        <MetricCard label="Manifestek" value={summary.manifests.length} detail={`${summary.manifestCoverage}% coverage`} />
        <MetricCard label="Status" value={summary.status} detail="scene registry" />
      </div>
      <Card>
        <h2 className="text-xl font-black">Utolsó scene-ek</h2>
        <div className="mt-4 space-y-3 text-sm">
          {summary.scenes.length === 0 ? <p className="text-slate-600">Még nincs generált scene. Hozz létre jobot a /api/3d/jobs endpointtal, majd futtasd a simulate endpointot.</p> : summary.scenes.map((scene) => {
            const item = scene as Record<string, unknown>;
            const id = String(item.id);
            return <div key={id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><span className="font-black">{String(item.sceneName ?? id)}</span><StatusPill label={String(item.status)} tone="amber" /></div><Link className="mt-2 inline-block text-sm font-bold text-brand-blue" href={`/spatial/${id}`}>Publikus viewer preview</Link></div>;
          })}
        </div>
      </Card>
    </div>
  );
}
