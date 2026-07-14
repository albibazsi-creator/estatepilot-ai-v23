import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function PortalExportsPage() {
  const { agency } = await getCurrentUser();
  const [exports, listings] = await Promise.all([
    prisma.portalExport.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.listing.findMany({ where: { agencyId: agency.id }, select: { id: true, title: true }, orderBy: { updatedAt: "desc" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Portal export</p>
        <h1 className="text-3xl font-black">Portál export központ</h1>
        <p className="mt-2 text-slate-600">Ingatlan.com / marketplace / custom JSON export előkészítés. A v7 még nem küld portál API-ra, de validált payloadot gyárt.</p>
      </div>

      <section className="rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-black">Új export</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {listings.map((listing) => (
            <form key={listing.id} action={`/api/listings/${listing.id}/portal-export`} method="post" className="rounded-2xl border p-4">
              <p className="font-bold">{listing.title}</p>
              <input type="hidden" name="targetPortal" value="custom_json" />
              <input type="hidden" name="format" value="json" />
              <button className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Export generálás</button>
              <p className="mt-2 text-xs text-slate-500">API teszthez POST JSON: {`{ "targetPortal": "custom_json", "format": "json" }`}</p>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-black">Export előzmények</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50"><tr><th className="p-3">Portál</th><th className="p-3">Státusz</th><th className="p-3">Formátum</th><th className="p-3">Dátum</th><th className="p-3">Letöltés</th></tr></thead>
            <tbody>
              {exports.map((item) => (
                <tr key={item.id} className="border-t"><td className="p-3 font-semibold">{item.targetPortal}</td><td className="p-3">{item.status}</td><td className="p-3">{item.format}</td><td className="p-3">{item.createdAt.toLocaleString("hu-HU")}</td><td className="p-3"><a className="font-bold text-slate-900 underline" href={`/api/portal-exports/${item.id}`}>JSON</a></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
