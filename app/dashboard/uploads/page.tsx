import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export default async function UploadsPage() {
  const { agency } = await getCurrentUser();
  const objects = await prisma.uploadObject.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 30 });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Upload objects</h1>
        <p className="mt-2 text-slate-500">v6 upload intent log. Élesben innen látható, mi ment R2/S3 bucketbe, mi pending, mi hibás.</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400"><tr><th className="py-3">Key</th><th>Provider</th><th>Status</th><th>MIME</th><th>Dátum</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {objects.map((object) => <tr key={object.id}><td className="max-w-md truncate py-3 font-mono text-xs">{object.storageKey}</td><td>{object.provider}</td><td>{object.status}</td><td>{object.mimeType}</td><td>{formatDate(object.createdAt)}</td></tr>)}
            </tbody>
          </table>
          {!objects.length && <p className="py-6 text-sm text-slate-500">Még nincs upload intent rekord.</p>}
        </div>
      </Card>
    </div>
  );
}
