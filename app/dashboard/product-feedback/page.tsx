import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";


export default async function ProductFeedbackPage() {
  const { agency } = await getCurrentUser();
  const feedback = await prisma.productFeedback.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const promoters = feedback.filter((f) => f.sentiment === "promoter").length;
  const detractors = feedback.filter((f) => f.sentiment === "detractor").length;
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Feedback loop</p><h1 className="text-3xl font-black">Product Feedback & NPS</h1><p className="mt-2 text-slate-600">Demo ügyfelek visszajelzéseiből roadmap és churn-risk jel.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Feedback" value={feedback.length} /><MetricCard label="Promoter" value={promoters} /><MetricCard label="Detractor" value={detractors} /></div><Card><div className="space-y-3">{feedback.map((f) => <div key={f.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><p className="font-black">{f.category}</p><StatusPill label={f.sentiment} tone={f.sentiment === "promoter" ? "green" : f.sentiment === "detractor" ? "red" : "slate"} /></div><p className="mt-2 text-sm text-slate-600">{f.message}</p><p className="mt-2 text-xs text-slate-400">Score: {f.score ?? "n/a"} • {f.userEmail ?? "anonymous"}</p></div>)}{!feedback.length ? <p className="text-slate-500">Nincs feedback.</p> : null}</div></Card></div>;
}
