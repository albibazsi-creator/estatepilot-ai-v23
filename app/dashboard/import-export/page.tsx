import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sample = {
  listings: [
    {
      title: "Új demo lakás importból",
      propertyType: "lakás",
      city: "Budapest",
      district: "XI. kerület",
      price: 82900000,
      sizeM2: 58,
      rooms: 2,
      descriptionRaw: "Importált demo listing."
    }
  ]
};

export default function ImportExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Import / Export központ</h1>
        <p className="mt-2 text-slate-500">Átadás fejlesztőnek, CRM migrációhoz, portál integrációhoz és ügyfél demo csomagokhoz.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Listing export</h2>
          <p className="mt-2 text-sm text-slate-500">Teljes agency listing lista JSON-ban vagy CSV-ben.</p>
          <div className="mt-4 flex gap-2">
            <Button href="/api/exports/listings?format=json">JSON export</Button>
            <Button href="/api/exports/listings?format=csv" variant="secondary">CSV export</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">Listing import API</h2>
          <p className="mt-2 text-sm text-slate-500">POST /api/import/listings maximum 50 listinggel egy körben.</p>
          <pre className="mt-4 overflow-auto rounded-2xl bg-slate-50 p-4 text-xs">{JSON.stringify(sample, null, 2)}</pre>
        </Card>
      </div>

      <Card className="bg-slate-950 text-white">
        <h2 className="text-xl font-black">Éles migrációs irány</h2>
        <p className="mt-2 text-sm text-white/70">Következő lépés: CSV parser, mezőmapping UI, duplikáció ellenőrzés, import preview, rollback batch ID és audit log. A mostani API már fejlesztői integrációhoz elég kiindulási alap.</p>
      </Card>
    </div>
  );
}
