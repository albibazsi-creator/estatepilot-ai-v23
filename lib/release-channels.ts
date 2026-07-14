import { prisma } from "@/lib/prisma";

export async function ensureDemoReleaseChannel() {
  const channel = await prisma.releaseChannel.upsert({
    where: { name: "demo" },
    update: { version: "0.10.0", status: "active", rolloutPercent: 100 },
    create: { name: "demo", environment: "demo", version: "0.10.0", status: "active", rolloutPercent: 100, guardrailsJson: { featureFlagsRequired: ["ai.real_vision", "portal_export.enabled"] } }
  });
  const existing = await prisma.changelogEntry.count({ where: { version: "0.10.0" } });
  if (!existing) {
    await prisma.changelogEntry.createMany({ data: [
      { releaseChannelId: channel.id, version: "0.10.0", title: "AI governance + privacy ops", body: "AI decision ledger, DSR export flow, AI evals and customer success health dashboards added.", category: "governance" },
      { releaseChannelId: channel.id, version: "0.10.0", title: "Enterprise handoff package", body: "SDK examples, privacy runbook, AI governance guide and release readiness checks added.", category: "ops" }
    ] });
  }
  return channel;
}
