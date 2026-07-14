import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getLive3dProviderBridge } from "@/lib/v21-start-before-launch";

export default function Live3dPage() {
  const bridge = getLive3dProviderBridge();
  return (
    <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Live 3D provider bridge</p><h1 className="text-3xl font-black">Digital twin provider / GPU worker kapcsoló</h1><p className="mt-2 text-slate-600">A v21 a 3D részt start előtt provider-bridge szintre emeli: worker URL, token, manifest outputok, QA gate és viewer preview.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="3D bridge score" value={`${bridge.score}%`} detail={bridge.status} /><MetricCard label="Mode" value={bridge.bridgeMode} detail="worker/provider" /><MetricCard label="Missing env" value={bridge.missingEnv.length} detail={bridge.missingEnv.join(", ") || "none"} /></div><Card><div className="flex items-center justify-between"><h2 className="text-xl font-black">Elfogadott 3D outputok és QA gate-ek</h2><StatusPill label={bridge.status} tone={bridge.status === "ready" ? "green" : bridge.status === "warning" ? "amber" : "red"} /></div><div className="mt-4 grid gap-3 md:grid-cols-2"><div><p className="font-black">Outputok</p>{bridge.acceptedOutputs.map((item) => <p key={item} className="mt-2 rounded-xl bg-slate-50 p-3 text-sm">{item}</p>)}</div><div><p className="font-black">QA gate-ek</p>{bridge.qaGates.map((item) => <p key={item} className="mt-2 rounded-xl bg-slate-50 p-3 text-sm">{item}</p>)}</div></div></Card></div>
  );
}
