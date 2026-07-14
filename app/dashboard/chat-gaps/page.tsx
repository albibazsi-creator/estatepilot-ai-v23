import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";

export default async function ChatGapsPage() {
  const { agency } = await getCurrentUser();
  const gaps = await prisma.chatKnowledgeGap.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black">AI Chat Knowledge Gaps</h1><p className="mt-1 text-slate-500">Amire az AI nem válaszolhatott biztosan, azt itt látod javítható property adatként.</p></div>
      <Card><div className="divide-y divide-slate-100">{gaps.map((gap) => <div key={gap.id} className="grid gap-3 py-4 md:grid-cols-[1fr_120px_120px]"><div><div className="font-bold">{gap.question}</div><div className="text-sm text-slate-500">{gap.safeReply}</div><div className="mt-1 text-xs text-slate-400">Javaslat: {gap.suggestedFact}</div></div><StatusPill label={gap.severity} tone={gap.severity === "high" ? "red" : "amber"} /><StatusPill label={gap.status} tone="blue" /></div>)}</div></Card>
    </div>
  );
}
