import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";

export default async function SellerActivitiesPage() {
  const { agency } = await getCurrentUser();
  const activities = await prisma.sellerPortalActivity.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black">Seller Activity Feed</h1><p className="mt-1 text-slate-500">Tulajdonosnak kommunikálható munka: leadek, kampányok, tour aktivitás és AI javaslatok.</p></div>
      <Card>
        <div className="divide-y divide-slate-100">
          {activities.map((a) => <div key={a.id} className="grid gap-3 py-4 md:grid-cols-[160px_1fr_100px]"><StatusPill label={a.activityType} tone="blue" /><div><div className="font-bold">{a.title}</div><div className="text-sm text-slate-500">{a.description}</div></div><div className="font-black">{a.impactScore}/100</div></div>)}
          {activities.length === 0 ? <p className="text-sm text-slate-500">Még nincs seller activity.</p> : null}
        </div>
      </Card>
    </div>
  );
}
