import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { calculatePricePosition } from "@/lib/valuation";
import { formatPrice } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";

export default async function ValuationPage() {
  const { agency } = await getCurrentUser();
  const listing = await prisma.listing.findFirst({ where: { agencyId: agency.id, price: { not: null }, sizeM2: { not: null } }, orderBy: { updatedAt: "desc" } });
  const comparables = await prisma.valuationComparable.findMany({ where: { agencyId: agency.id, ...(listing ? { listingId: listing.id } : {}) }, orderBy: { similarityScore: "desc" } });
  const valuation = listing ? calculatePricePosition(listing, comparables) : null;
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black">Valuation & Market Position</h1><p className="mt-1 text-slate-500">Manuális összehasonlító minták alapján árpozíció. Nem hivatalos értékbecslés.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><div className="text-sm text-slate-500">Listing Ft/m²</div><div className="mt-2 text-2xl font-black">{valuation?.listingPricePerM2 ? formatPrice(valuation.listingPricePerM2) : "n/a"}</div></Card>
        <Card><div className="text-sm text-slate-500">Comparable medián Ft/m²</div><div className="mt-2 text-2xl font-black">{valuation?.medianComparablePricePerM2 ? formatPrice(valuation.medianComparablePricePerM2) : "n/a"}</div></Card>
        <Card><div className="text-sm text-slate-500">Pozíció</div><div className="mt-2"><StatusPill label={valuation?.position ?? "unknown"} tone={valuation?.position === "above_market" ? "amber" : "green"} /></div></Card>
      </div>
      <Card><h2 className="text-xl font-black">AI ajánlás</h2><p className="mt-3 text-slate-700">{valuation?.recommendation ?? "Adj hozzá összehasonlító mintákat az API-n keresztül."}</p></Card>
      <Card>
        <h2 className="text-xl font-black">Comparable minták</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {comparables.map((c) => <div key={c.id} className="grid gap-3 py-4 md:grid-cols-[1fr_150px_150px_100px]"><div><div className="font-bold">{c.title}</div><div className="text-sm text-slate-500">{c.city} {c.district}</div></div><div>{formatPrice(c.price)}</div><div>{formatPrice(c.pricePerM2)} / m²</div><div>{c.similarityScore}/100</div></div>)}
          {comparables.length === 0 ? <p className="text-sm text-slate-500">Még nincs összehasonlító minta.</p> : null}
        </div>
      </Card>
    </div>
  );
}
