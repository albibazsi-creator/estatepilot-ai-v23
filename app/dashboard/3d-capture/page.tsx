import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { buildCapturePlan, getDigitalTwinReadiness } from "@/lib/spatial-3d";

export default async function ThreeDCapturePage() {
  const { agency } = await getCurrentUser();
  const [plan, readiness] = await Promise.all([buildCapturePlan(agency.id), getDigitalTwinReadiness(agency.id)]);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Mobile capture workflow</p>
        <h1 className="text-3xl font-black">3D Capture Studio</h1>
        <p className="mt-2 text-slate-600">Vezetett mobilos fotó/videó/360 rögzítés, hogy a későbbi 3D rekonstrukcióhoz ne hiányozzanak a kritikus nézőpontok.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Capture target" value={plan.listing?.title ?? "Nincs listing"} detail="aktuális listing" />
        <MetricCard label="Digital twin score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="Required shots" value={plan.requiredShots.length} detail="capture checklist" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Kötelező 3D capture shotlista</h2>
          <div className="mt-4 space-y-3">
            {plan.requiredShots.map((shot) => (
              <div key={shot.key} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between"><h3 className="font-black">{shot.title}</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase">{shot.priority}</span></div>
                <p className="mt-1 text-sm text-slate-600">{shot.why}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Operátori instrukció</h2>
          <ol className="mt-4 space-y-3">
            {plan.instructions.map((instruction, index) => (
              <li key={instruction} className="rounded-2xl border p-4 text-sm"><span className="mr-2 font-black text-brand-gold">{index + 1}.</span>{instruction}</li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
