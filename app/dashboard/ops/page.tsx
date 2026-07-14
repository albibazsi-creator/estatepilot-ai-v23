import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runConfigDoctor, summarizeDoctor } from "@/lib/config-doctor";

const severityClass = {
  ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200"
};

export default function OpsPage() {
  const checks = runConfigDoctor();
  const summary = summarizeDoctor(checks);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-black">Production Doctor</h1>
          <p className="mt-2 text-slate-500">A v6 élesítési panel megmutatja, mi hiányzik még ahhoz, hogy a rendszer ne csak demo legyen.</p>
        </div>
        <Button href="/api/ops/doctor" variant="secondary">JSON health export</Button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <Card><div className="text-sm text-slate-500">Élesítési pontszám</div><div className="mt-1 text-4xl font-black">{summary.score}%</div></Card>
        <Card><div className="text-sm text-slate-500">OK</div><div className="mt-1 text-4xl font-black text-emerald-600">{summary.ok}</div></Card>
        <Card><div className="text-sm text-slate-500">Figyelmeztetés</div><div className="mt-1 text-4xl font-black text-amber-600">{summary.warnings}</div></Card>
        <Card><div className="text-sm text-slate-500">Hiba</div><div className="mt-1 text-4xl font-black text-red-600">{summary.errors}</div></Card>
      </div>

      <div className="grid gap-4">
        {checks.map((check) => (
          <Card key={check.key} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${severityClass[check.severity]}`}>{check.severity}</span>
                <h2 className="text-lg font-black">{check.label}</h2>
              </div>
              <p className="mt-2 text-sm text-slate-500">{check.nextAction}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">{check.status}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
