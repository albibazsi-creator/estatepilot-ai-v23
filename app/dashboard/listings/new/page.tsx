import { ListingForm } from "@/components/dashboard/listing-form";

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Új ingatlan</h1>
        <p className="text-slate-500">Add meg az alapadatokat, utána jöhet a média, AI leírás és public landing oldal.</p>
      </div>
      <ListingForm />
    </div>
  );
}
