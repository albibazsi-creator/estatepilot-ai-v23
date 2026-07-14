import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export default async function SpatialAssetsPage() {
  const { agency } = await getCurrentUser();
  const listings = await prisma.listing.findMany({ where: { agencyId: agency.id }, include: { media: true, tours: { include: { nodes: true, hotspots: true } }, floorplans: true }, orderBy: { createdAt: "desc" }, take: 10 });
  const media = listings.flatMap((listing) => listing.media.map((item) => ({ ...item, listingTitle: listing.title })));
  const spatialMedia = media.filter((item) => ["VIDEO", "PANORAMA_360", "FLOORPLAN"].includes(item.mediaType));
  const tours = listings.flatMap((listing) => listing.tours.map((tour) => ({ ...tour, listingTitle: listing.title })));
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Spatial asset registry</p>
        <h1 className="text-3xl font-black">3D / 360 asset registry</h1>
        <p className="mt-2 text-slate-600">Egy helyen látod a 360 képeket, videókat, floorplaneket és tour node-okat, amelyekből digitális iker épülhet.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Spatial media" value={spatialMedia.length} detail="video/360/floorplan" />
        <MetricCard label="Tours" value={tours.length} detail="Matterport/custom/iframe" />
        <MetricCard label="Room nodes" value={tours.reduce((sum, tour) => sum + tour.nodes.length, 0)} detail="tour graph" />
        <MetricCard label="Hotspots" value={tours.reduce((sum, tour) => sum + tour.hotspots.length, 0)} detail="navigation" />
      </div>
      <Card>
        <h2 className="text-xl font-black">Spatial média</h2>
        <div className="mt-4 space-y-3">
          {spatialMedia.length ? spatialMedia.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4 text-sm">
              <div className="flex items-center justify-between"><span className="font-black">{item.mediaType} • {item.roomLabel ?? "nincs címke"}</span><span className="font-semibold text-slate-500">{item.processingStatus}</span></div>
              <p className="mt-1 text-slate-600">{item.listingTitle}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{item.url}</p>
            </div>
          )) : <p className="text-sm text-slate-600">Még nincs 360/video/floorplan média. A 3D capture shotlistával kezdj.</p>}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Tour registry</h2>
        <div className="mt-4 space-y-3">
          {tours.map((tour) => (
            <div key={tour.id} className="rounded-2xl border p-4 text-sm">
              <div className="flex items-center justify-between"><span className="font-black">{tour.tourType} • {tour.provider ?? "custom"}</span><span className="font-semibold text-slate-500">{tour.status}</span></div>
              <p className="mt-1 text-slate-600">{tour.listingTitle}</p>
              <p className="mt-1 text-xs text-slate-500">{tour.nodes.length} node • {tour.hotspots.length} hotspot</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
