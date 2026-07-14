import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";


export default async function BackupsPage() {
  const { agency } = await getCurrentUser();
  const snapshots = await prisma.backupSnapshot.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Reliability</p><h1 className="text-3xl font-black">Backup Snapshot Center</h1><p className="mt-2 text-slate-600">Metaadat backup és restore-readiness napló. Médiafájlok storage providerben maradnak.</p></div><form action="/api/backups/snapshots" method="post"><Button>Snapshot készítés</Button></form></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Snapshot" value={snapshots.length} /><MetricCard label="Legutóbbi státusz" value={snapshots[0]?.status ?? "n/a"} /><MetricCard label="Provider" value={snapshots[0]?.storageProvider ?? "n/a"} /></div><Card><div className="space-y-3">{snapshots.map((s) => <div key={s.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><p className="font-black">{s.snapshotType}</p><StatusPill label={s.status} tone="green" /></div><p className="mt-2 text-sm text-slate-600">{s.storageKey ?? "local metadata"}</p><p className="mt-1 text-xs text-slate-400">Checksum: {s.checksum ?? "n/a"}</p></div>)}{!snapshots.length ? <p className="text-slate-500">Nincs snapshot.</p> : null}</div></Card></div>;
}
