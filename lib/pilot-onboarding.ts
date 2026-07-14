import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const milestones = [
  { key: "pilot-owner", title: "Pilot owner kijelölése", days: 0 },
  { key: "first-live-listing", title: "Első éles ingatlan feltöltése", days: 1 },
  { key: "media-quality-pass", title: "Képek + cover image quality pass", days: 2 },
  { key: "seller-report-approved", title: "Első seller report jóváhagyása", days: 3 },
  { key: "lead-flow-tested", title: "Lead capture + follow-up flow tesztelve", days: 4 },
  { key: "provider-switch-plan", title: "Mock providerek élesítésének terve", days: 5 },
  { key: "success-metrics", title: "Pilot siker-metrikák rögzítése", days: 7 }
];

export async function ensurePilotMilestones(agencyId?: string | null, ownerEmail = env.PILOT_OWNER_EMAIL) {
  const now = new Date();
  const result = [];
  for (const m of milestones) {
    const dueAt = new Date(now.getTime() + m.days * 24 * 60 * 60 * 1000);
    result.push(await prisma.pilotOnboardingMilestone.upsert({
      where: { agencyId_key: { agencyId: agencyId ?? null, key: m.key } },
      update: { ownerEmail },
      create: { agencyId: agencyId ?? null, key: m.key, title: m.title, ownerEmail, dueAt, evidenceJson: { expectedEvidence: ["screenshot", "demo note", "customer approval"] } }
    }));
  }
  return result;
}

export async function getPilotOnboardingSummary(agencyId?: string | null) {
  await ensurePilotMilestones(agencyId);
  const items = await prisma.pilotOnboardingMilestone.findMany({ where: { agencyId: agencyId ?? null }, orderBy: { dueAt: "asc" } });
  const done = items.filter((i) => i.status === "done").length;
  const blocked = items.filter((i) => i.status === "blocked").length;
  const overdue = items.filter((i) => i.dueAt && i.status !== "done" && i.dueAt.getTime() < Date.now()).length;
  const score = Math.round((done / Math.max(items.length, 1)) * 100);
  const status = blocked > 0 ? "blocked" : score >= 80 ? "pilot_ready" : overdue > 0 ? "attention_needed" : "on_track";
  return { items, total: items.length, done, blocked, overdue, score, status };
}
