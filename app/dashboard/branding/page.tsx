import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dnsInstructions } from "@/lib/branding";
import { randomUUID } from "crypto";

export default async function BrandingPage() {
  const { agency } = await getCurrentUser();
  let profile = await prisma.agencyBrandingProfile.findFirst({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
  if (!profile) {
    profile = await prisma.agencyBrandingProfile.create({ data: { agencyId: agency.id, brandName: agency.name, footerText: "Powered by EstatePilot AI" } });
  }
  let domain = await prisma.whiteLabelDomain.findFirst({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
  if (!domain) {
    domain = await prisma.whiteLabelDomain.create({ data: { agencyId: agency.id, domain: "demo.estatepilot.local", verificationToken: randomUUID() } });
  }
  const dns = dnsInstructions(domain.domain, domain.verificationToken);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">White-label brand center</h1>
          <p className="mt-1 text-slate-500">Irodai márka, domain, CSS tokenek és publikus listing élmény.</p>
        </div>
        <Button href="/dashboard/settings">Beállítások</Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Aktív brand profil</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p><b>Név:</b> {profile.brandName}</p>
            <p><b>Tone:</b> {profile.publicTone}</p>
            <div className="flex gap-3">
              <span className="rounded-xl border px-3 py-2" style={{ background: profile.primaryColor, color: "white" }}>Primary {profile.primaryColor}</span>
              <span className="rounded-xl border px-3 py-2" style={{ background: profile.accentColor }}>Accent {profile.accentColor}</span>
            </div>
            <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">{`:root {\n  --brand-primary: ${profile.primaryColor};\n  --brand-accent: ${profile.accentColor};\n}`}</pre>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">White-label domain</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p><b>Domain:</b> {domain.domain}</p>
            <p><b>Státusz:</b> {domain.status} • SSL: {domain.sslStatus}</p>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-bold">DNS instrukció:</p>
              {dns.records.map((r) => <p key={r.type + r.host} className="font-mono text-xs">{r.type} {r.host} → {r.value}</p>)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
