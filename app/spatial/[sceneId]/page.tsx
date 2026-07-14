import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";

export default async function SpatialScenePage({ params }: { params: Promise<{ sceneId: string }> }) {
  const { sceneId } = await params;
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">EstatePilot Spatial Viewer</p>
            <h1 className="text-3xl font-black">3D scene preview</h1>
            <p className="mt-2 text-slate-300">Scene ID: {sceneId}</p>
          </div>
          <StatusPill label="review required" tone="amber" />
        </div>
        <div className="mt-8 aspect-video rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.22),_rgba(15,23,42,1)_55%)] p-8 shadow-2xl">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full border border-brand-gold/50 px-5 py-2 text-sm font-bold text-brand-gold">.splat / .ksplat / .ply viewer adapter</div>
            <h2 className="mt-6 text-4xl font-black">WebGL renderer placeholder</h2>
            <p className="mt-3 max-w-2xl text-slate-300">V17-ben ez már publikus 3D viewer shell és manifest contract. A tényleges renderer ide köthető: SuperSplat, PlayCanvas, Three.js vagy saját Gaussian Splatting viewer.</p>
          </div>
        </div>
        <Card className="mt-6 border-white/10 bg-white/5 text-white">
          <h2 className="text-xl font-black">Disclosure</h2>
          <p className="mt-2 text-sm text-slate-300">AI generated 3D reconstruction preview. Verify geometry and dimensions before publication. Original photos and floorplan must remain available.</p>
        </Card>
      </div>
    </main>
  );
}
