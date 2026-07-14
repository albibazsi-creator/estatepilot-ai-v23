import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function FeatureFlagsPage() {
  const { agency } = await getCurrentUser();
  const flags = await prisma.featureFlag.findMany({ where: { OR: [{ agencyId: agency.id }, { agencyId: null }] }, orderBy: { key: "asc" } });
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Release controls</p>
        <h1 className="text-3xl font-black">Feature flag központ</h1>
        <p className="mt-2 text-slate-600">Új funkciók fokozatos bekapcsolásához: staging, portal export, buyer chat, billing, AI agent.</p>
      </div>
      <section className="rounded-3xl border bg-white p-6">
        <div className="grid gap-3 md:grid-cols-2">
          {flags.map((flag) => (
            <div key={flag.id} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between"><p className="font-black">{flag.key}</p><span className={`rounded-full px-3 py-1 text-xs font-bold ${flag.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{flag.enabled ? "ON" : "OFF"}</span></div>
              <p className="mt-2 text-sm text-slate-600">{flag.description ?? "Nincs leírás."}</p>
            </div>
          ))}
          {!flags.length ? <p className="text-slate-500">Nincs feature flag seedelve.</p> : null}
        </div>
      </section>
    </div>
  );
}
