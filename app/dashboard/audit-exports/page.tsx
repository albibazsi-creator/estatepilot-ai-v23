import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { generateEnterpriseAuditBundle } from "@/lib/audit-export";

export default async function AuditExportsPage() {
  const { agency } = await getCurrentUser();
  const existing = await prisma.auditExportBundle.findMany({ where: { agencyId: agency.id }, orderBy: { generatedAt: "desc" }, take: 20 });
  const bundles = existing.length ? existing : [await generateEnterpriseAuditBundle(agency.id, agency.billingEmail ?? undefined)];
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 audit exports</p><h1 className="text-3xl font-black">Enterprise Audit Bundle</h1><p className="mt-2 text-slate-600">Befektetői / enterprise átvilágításhoz exportálható governance, költség, release és tenant összefoglaló.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Bundles" value={bundles.length} detail="generált" /><MetricCard label="Latest" value={bundles[0]?.status ?? "none"} detail="status" /><MetricCard label="Checksum" value={bundles[0]?.checksum?.slice(0, 8) ?? "n/a"} detail="sha256 prefix" /></div><Card><div className="space-y-3">{bundles.map((b) => <div key={b.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><p className="font-black">{b.fileName}</p><StatusPill status={b.status} /></div><p className="mt-2 text-sm text-slate-500">{b.exportType} • {b.generatedAt.toLocaleString("hu-HU")}</p><p className="mt-1 text-xs text-slate-400">checksum: {b.checksum}</p></div>)}</div></Card></div>;
}
