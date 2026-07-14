import { prisma } from "@/lib/prisma";

export async function ensureMonitoringProbes(agencyId: string) {
  const defaults = [
    { name: "Public listing availability", target: "/api/health", status: "healthy", latencyMs: 42, uptimePercent: 100 },
    { name: "AI job processor", target: "jobs:process", status: "demo_mock", latencyMs: 88, uptimePercent: 100 },
    { name: "Storage adapter", target: "uploads:intent", status: "configured_mock", latencyMs: 51, uptimePercent: 100 },
    { name: "Billing provider", target: "billing:checkout-v2", status: "skeleton", latencyMs: 61, uptimePercent: 99 }
  ];
  for (const probe of defaults) {
    const existing = await prisma.monitoringProbe.findFirst({ where: { agencyId, target: probe.target } });
    if (!existing) await prisma.monitoringProbe.create({ data: { agencyId, ...probe, lastCheckedAt: new Date(), metadataJson: { source: "v11_seed" } } });
  }
  return prisma.monitoringProbe.findMany({ where: { agencyId }, orderBy: { name: "asc" } });
}

export async function getMonitoringSummary(agencyId: string) {
  const probes = await ensureMonitoringProbes(agencyId);
  const unhealthy = probes.filter((p) => !["healthy", "demo_mock", "configured_mock", "skeleton"].includes(p.status)).length;
  const avgLatency = probes.length ? Math.round(probes.reduce((sum, p) => sum + (p.latencyMs ?? 0), 0) / probes.length) : 0;
  return { probes, summary: { total: probes.length, unhealthy, avgLatency, status: unhealthy ? "attention" : "demo_ready" } };
}
