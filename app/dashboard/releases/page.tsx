import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";


export default async function ReleasesPage() {
  await import("@/lib/release-channels").then((m) => m.ensureDemoReleaseChannel());
  const channels = await prisma.releaseChannel.findMany({ orderBy: { updatedAt: "desc" } });
  const changelog = await prisma.changelogEntry.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Release management</p><h1 className="text-3xl font-black">Release Channel & Changelog</h1><p className="mt-2 text-slate-600">Demo/staging/production rollout, ügyfélnek látható changelog és guardrail követelmények.</p></div><div className="grid gap-4 md:grid-cols-3">{channels.map((c) => <MetricCard key={c.id} label={c.name} value={c.version} detail={`${c.environment} • ${c.rolloutPercent}%`} />)}</div><Card><div className="space-y-3">{changelog.map((c) => <div key={c.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><p className="font-black">{c.title}</p><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{c.version}</span></div><p className="mt-2 text-sm text-slate-600">{c.body}</p><p className="mt-1 text-xs text-slate-400">{c.category} • {c.visibleToCustomers ? "customer-visible" : "internal"}</p></div>)}</div></Card></div>;
}
