import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { validateSceneManifestStrict } from "@/lib/spatial-v18";

export default async function ManifestValidatorPage() {
  const { agency } = await getCurrentUser();
  const validation = await validateSceneManifestStrict(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D manifest validator</p>
        <h1 className="text-3xl font-black">Strict Scene Manifest Gate</h1>
        <p className="mt-2 text-slate-600">Publikálás előtt ellenőrzi, hogy a .splat/.ksplat, preview, minőségi score-ok, disclosure és checksum megvannak-e.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Validation score" value={`${validation.score}%`} detail={validation.status} />
        <MetricCard label="Checks" value={validation.checks.length} detail="manifest gate" />
        <MetricCard label="Source" value={validation.source} detail="validation input" />
      </div>
      <Card>
        <div className="space-y-3">
          {validation.checks.map((check) => (
            <div key={check.key} className="flex items-center justify-between rounded-2xl border p-3 text-sm">
              <span><b>{check.label}</b> <span className="text-slate-500">({check.severity})</span></span>
              <StatusPill label={check.passed ? "passed" : "missing"} tone={check.passed ? "green" : "red"} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
