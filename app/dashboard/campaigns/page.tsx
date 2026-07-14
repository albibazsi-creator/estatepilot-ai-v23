import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";
import { GenerateCampaignButton } from "@/components/dashboard/marketing-actions";

export default async function CampaignsPage() {
  const { agency } = await getCurrentUser();
  const [campaigns, listings] = await Promise.all([
    prisma.marketingCampaign.findMany({ where: { agencyId: agency.id }, include: { listing: true }, orderBy: { createdAt: "desc" } }),
    prisma.listing.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">AI kampányközpont</h1>
        <p className="text-slate-500">Meta, Instagram, Reels és email kreatív csomagok listingekhez.</p>
      </div>

      <Card>
        <h2 className="text-xl font-black">Gyors kampánygenerálás</h2>
        <div className="mt-4 grid gap-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
              <div>
                <div className="font-bold">{listing.title}</div>
                <div className="text-sm text-slate-500">{listing.city} {listing.district ?? ""}</div>
              </div>
              <GenerateCampaignButton listingId={listing.id} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black">{campaign.name}</h2>
                  <StatusPill label={campaign.status} tone={campaign.status === "READY" ? "green" : "amber"} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{campaign.listing.title} • {formatDate(campaign.createdAt)}</p>
              </div>
              <Button href={`/api/campaigns/${campaign.id}`} variant="secondary">JSON</Button>
            </div>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs">{JSON.stringify(campaign.assetsJson, null, 2)}</pre>
          </Card>
        ))}
        {campaigns.length === 0 ? <Card><p className="text-sm text-slate-500">Még nincs kampány. Generálj egyet valamelyik listinghez.</p></Card> : null}
      </div>
    </div>
  );
}
