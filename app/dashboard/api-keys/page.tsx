import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export default async function ApiKeysPage() {
  const { agency } = await getCurrentUser();
  const keys = await prisma.apiKey.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">API kulcsok</h1>
        <p className="mt-2 text-slate-500">Külső portálokhoz, importhoz vagy partner dashboardhoz előkészített biztonságos API kulcs kezelés.</p>
      </div>

      <Card className="bg-slate-950 text-white">
        <h2 className="text-xl font-black">Új kulcs létrehozása</h2>
        <p className="mt-2 text-sm text-white/70">POST /api/api-keys body: {`{"name":"Portal connector","scopes":["listings:read","leads:write"]}`}</p>
        <p className="mt-2 text-sm text-brand-gold">A plain key csak egyszer jelenik meg. Élesben ezt agency owner/admin szerepkörhöz kell kötni.</p>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Aktív / visszavont kulcsok</h2>
          <Button href="/api/api-keys" variant="secondary">JSON lista</Button>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {keys.map((key) => (
            <div key={key.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
              <div>
                <div className="font-bold">{key.name}</div>
                <div className="text-slate-500">{key.prefix} • {key.scopes.join(", ")} • {formatDate(key.createdAt)}</div>
              </div>
              <div className={key.revokedAt ? "text-red-600" : "text-green-700"}>{key.revokedAt ? "Visszavonva" : "Aktív"}</div>
            </div>
          ))}
          {keys.length === 0 ? <p className="py-4 text-sm text-slate-500">Még nincs API kulcs.</p> : null}
        </div>
      </Card>
    </div>
  );
}
