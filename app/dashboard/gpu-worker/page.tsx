import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getGpuWorkerDeploymentPlan } from "@/lib/spatial-v18";

export default function GpuWorkerPage() {
  const plan = getGpuWorkerDeploymentPlan();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">GPU worker deployment</p>
        <h1 className="text-3xl font-black">Gaussian Splatting GPU Worker Plan</h1>
        <p className="mt-2 text-slate-600">Saját vagy külső workerhez szükséges env, queue, artifact bucket, Docker/GPU deployment és webhook contract.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Deploy score" value={`${plan.score}%`} detail={plan.status} />
        <MetricCard label="Missing env" value={plan.missingEnv.length} detail="required" />
        <MetricCard label="Optional missing" value={plan.optionalMissing.length} detail="nice-to-have" />
      </div>
      <Card>
        <h2 className="text-xl font-black">Hiányzó kötelező env-ek</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {plan.missingEnv.length ? plan.missingEnv.map((key) => <StatusPill key={key} label={key} tone="red" />) : <StatusPill label="Minden kötelező env megvan" tone="green" />}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Recommended stack</h2>
        <ol className="mt-4 space-y-2 text-sm text-slate-700">
          {plan.recommendedStack.map((step, index) => <li key={step}><b>{index + 1}.</b> {step}</li>)}
        </ol>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Deployment targetek</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {plan.deploymentTargets.map((target) => <div key={target.key} className="rounded-2xl border p-4 text-sm"><div className="font-black">{target.label}</div><StatusPill label={target.mode} tone={target.mode === "recommended" ? "green" : "blue"} /><p className="mt-2 text-slate-600">{target.why}</p></div>)}
        </div>
      </Card>
    </div>
  );
}
