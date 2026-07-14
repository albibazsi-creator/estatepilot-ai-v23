import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { buildPublishChecklist } from "@/lib/compliance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CompliancePage() {
  const { agency } = await getCurrentUser();
  const listings = await prisma.listing.findMany({ where: { agencyId: agency.id }, include: { media: true, tours: true, floorplans: true }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Compliance / publikálási audit</h1>
        <p className="mt-2 text-slate-500">AI staging, alapadat, galéria, tour, alaprajz és GDPR ellenőrzések egy helyen.</p>
      </div>

      <div className="grid gap-5">
        {listings.map((listing) => {
          const check = buildPublishChecklist(listing);
          return (
            <Card key={listing.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{listing.title}</h2>
                  <p className="text-sm text-slate-500">/{listing.slug}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">{check.score}/100</div>
                  <div className={check.canPublish ? "text-sm text-green-700" : "text-sm text-red-600"}>{check.canPublish ? "Publikálható" : "Javítás kell"}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {check.items.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="font-bold">{item.label} <span className={item.status === "pass" ? "text-green-700" : item.status === "warning" ? "text-amber-600" : "text-red-600"}>• {item.status}</span></div>
                    <p className="mt-1 text-slate-500">{item.details}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button href={`/dashboard/listings/${listing.id}`} variant="secondary">Listing szerkesztése</Button>
                <Button href={`/api/listings/${listing.id}/publish-checklist`} variant="ghost">API checklist</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
