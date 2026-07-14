import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export default async function ConsentsPage() {
  const { agency } = await getCurrentUser();
  const consents = await prisma.consentRecord.findMany({ where: { agencyId: agency.id }, orderBy: { acceptedAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">GDPR log</p>
        <h1 className="text-3xl font-black">Hozzájárulási napló</h1>
        <p className="mt-2 text-slate-600">Lead capture és utánkövetés consent bizonyítékok. Éles rendszerben ez kulcsfontosságú.</p>
      </div>
      <section className="rounded-3xl border bg-white p-6">
        <div className="overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50"><tr><th className="p-3">Purpose</th><th className="p-3">Email</th><th className="p-3">Forrás</th><th className="p-3">Elfogadva</th></tr></thead>
            <tbody>
              {consents.map((c) => <tr key={c.id} className="border-t"><td className="p-3 font-semibold">{c.purpose}</td><td className="p-3">{c.subjectEmail ?? "—"}</td><td className="p-3">{c.source}</td><td className="p-3">{c.acceptedAt.toLocaleString("hu-HU")}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
