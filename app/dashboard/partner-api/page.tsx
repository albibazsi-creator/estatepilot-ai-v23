import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { partnerApiContractV2 } from "@/lib/partner-contract";

export default async function PartnerApiPage() {
  const { agency } = await getCurrentUser();
  const logs = await prisma.partnerApiRequestLog.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 30 });
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black tracking-tight">Partner API v2</h1><p className="mt-1 text-slate-500">Portálok, franchise rendszerek és külső landing integrációk előkészítése.</p></div>
      <Card><h2 className="text-xl font-black">Contract</h2><pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{JSON.stringify(partnerApiContractV2, null, 2)}</pre></Card>
      <Card><h2 className="text-xl font-black">Request log</h2><div className="mt-4 divide-y divide-slate-100">{logs.map((l) => <div key={l.id} className="grid gap-2 py-3 text-sm md:grid-cols-5"><b>{l.method}</b><span className="md:col-span-2">{l.endpoint}</span><span>{l.statusCode}</span><span>{l.latencyMs ?? 0} ms</span></div>)}{!logs.length ? <p className="py-4 text-sm text-slate-500">Még nincs partner API hívás.</p> : null}</div></Card>
    </div>
  );
}
