import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { createSpatialSharePackage } from "@/lib/spatial-v19";

export default async function SpatialSharingPage() {
  const { agency } = await getCurrentUser();
  const data = await createSpatialSharePackage(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Tenant-safe sharing</p><h1 className="text-3xl font-black">3D Share Package</h1><p className="mt-2 text-slate-600">Tulajdonosnak, buyernek vagy belső review-ra adható időkorlátos, vízjeles 3D megosztási csomag.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Status" value={data.status} detail={data.audience} /><MetricCard label="Scene" value={data.sceneId} detail="scene id" /><MetricCard label="Expires" value={data.expiresAt.toISOString().slice(0, 10)} detail="share TTL" /><MetricCard label="Download" value={data.permissionsJson.canDownload ? "yes" : "no"} detail="permission" /></div>
      <Card><h2 className="text-xl font-black">Share URL</h2><p className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm font-semibold">{data.url}</p></Card>
      <Card><h2 className="text-xl font-black">Disclosure</h2><p className="mt-3 text-sm text-slate-700">{data.disclosureText}</p></Card>
    </div>
  );
}
