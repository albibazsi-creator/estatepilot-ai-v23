import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { StatusPill } from "@/components/status-pill";

export default async function ListingsPage() {
  const { agency } = await getCurrentUser();
  const listings = await prisma.listing.findMany({
    where: { agencyId: agency.id },
    include: { media: true, leads: true, tours: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Ingatlanok</h1>
          <p className="text-slate-500">MVP listing kezelő, AI modulokkal és public landing oldalakkal.</p>
        </div>
        <Button href="/dashboard/listings/new">Új ingatlan</Button>
      </div>

      <div className="grid gap-4">
        {listings.map((listing) => {
          const cover = listing.media.find((m) => m.isCover) ?? listing.media[0];
          return (
            <Card key={listing.id} className="flex flex-col gap-4 md:flex-row md:items-center">
              <img src={cover?.url ?? "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"} alt="" className="h-36 w-full rounded-2xl object-cover md:w-56" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black"><Link href={`/dashboard/listings/${listing.id}`}>{listing.title}</Link></h2>
                  <StatusPill label={listing.isPublished ? "Publikus" : "Draft"} tone={listing.isPublished ? "green" : "amber"} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{listing.city} {listing.district ?? ""} • {listing.sizeM2 ?? "–"} m² • {listing.rooms ?? "–"} szoba • {formatPrice(listing.price)}</p>
                <p className="mt-2 text-sm text-slate-500">{listing.media.length} média • {listing.tours.length} tour • {listing.leads.length} lead</p>
              </div>
              <div className="flex gap-2">
                <Button href={`/dashboard/listings/${listing.id}`} variant="secondary">Szerkesztés</Button>
                <Button href={`/listing/${listing.slug}`}>Public</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
