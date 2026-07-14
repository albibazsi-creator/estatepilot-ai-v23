import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TranslationsPage() {
  const { agency } = await getCurrentUser();
  const [translations, listings] = await Promise.all([
    prisma.listingTranslation.findMany({ where: { agencyId: agency.id }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.listing.findMany({ where: { agencyId: agency.id }, select: { id: true, title: true }, take: 10 })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Többnyelvű listing center</h1>
        <p className="mt-1 text-slate-500">HU/EN/DE listing szövegek, disclosure és külföldi vevőkre optimalizált leírások.</p>
      </div>
      <Card>
        <h2 className="text-xl font-black">Gyors generálás</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="rounded-2xl border p-4">
              <div className="font-bold">{listing.title}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['hu','en','de'].map((locale) => <Button key={locale} href={`/api/listings/${listing.id}/translations/generate?locale=${locale}`} size="sm" variant="secondary">{locale.toUpperCase()}</Button>)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Fordítások</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {translations.map((t) => (
            <div key={t.id} className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div><b>{t.locale.toUpperCase()}</b> • {t.title}</div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{t.status}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{t.shortHook}</p>
            </div>
          ))}
          {!translations.length ? <p className="py-4 text-sm text-slate-500">Még nincs fordítás. Generálj egyet a fenti gombokkal.</p> : null}
        </div>
      </Card>
    </div>
  );
}
