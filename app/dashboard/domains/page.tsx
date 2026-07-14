import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getDomainReadiness } from "@/lib/domain-readiness";

export default async function DomainsPage() {
  const { agency } = await getCurrentUser();
  const summary = await getDomainReadiness(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">DNS / SSL</p><h1 className="text-3xl font-black">Domain Readiness</h1><p className="mt-2 text-slate-600">App és listing domain verifikáció előkészítése.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Domain score" value={`${summary.score}%`} detail={summary.status} /><MetricCard label="Verified" value={summary.verified} detail="domain" /><MetricCard label="Total" value={summary.domains.length} detail="domain" /></div><div className="grid gap-4 md:grid-cols-2">{summary.domains.map((d) => <Card key={d.id}><div className="flex items-center justify-between"><h2 className="text-xl font-black">{d.domain}</h2><StatusPill label={d.status} tone={d.status === "verified" ? "green" : "amber"} /></div><p className="mt-2 text-sm text-slate-600">Purpose: {d.purpose}</p><p className="mt-1 text-sm text-slate-600">DNS target: {d.dnsTarget}</p><p className="mt-1 text-sm text-slate-600">SSL: {d.sslStatus}</p></Card>)}</div></div>;
}
