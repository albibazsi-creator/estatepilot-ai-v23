import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";

const planned = [
  { provider: "OpenAI", type: "ai", description: "Képelemzés, szöveggenerálás, property chat." },
  { provider: "Cloudflare R2", type: "storage", description: "Kép, videó, PDF és 3D fájl tárolás." },
  { provider: "Resend", type: "email", description: "Lead és seller report email értesítések." },
  { provider: "Google Calendar", type: "calendar", description: "Megtekintési slotok és naptárszinkron." },
  { provider: "Barion / Stripe", type: "billing", description: "Pay-per-listing és előfizetéses csomagok." },
  { provider: "Számlázz.hu", type: "invoice", description: "Magyar számlázási automatizmus." }
];

export default async function IntegrationsPage() {
  const { agency } = await getCurrentUser();
  const integrations = await prisma.integration.findMany({ where: { agencyId: agency.id }, orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Integrációk</h1>
        <p className="text-slate-500">Éles SaaS-hoz szükséges külső rendszerek állapota és bekötési pontjai.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {planned.map((item) => {
          const current = integrations.find((i) => i.provider === item.provider && i.type === item.type);
          return (
            <Card key={`${item.provider}-${item.type}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">{item.provider}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </div>
                <StatusPill label={current?.status ?? "planned"} tone={current ? "green" : "amber"} />
              </div>
              <form action={async () => {
                "use server";
                await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/integrations`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ provider: item.provider, type: item.type, status: "mock", configJson: { note: "Prepared in v4" } })
                });
              }} className="mt-4">
                <Button type="submit" size="sm" variant="secondary">Mock kapcsolat jelölése</Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
