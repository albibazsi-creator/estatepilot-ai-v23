"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  listing?: {
    id: string;
    title: string;
    propertyType: string;
    sellerName?: string | null;
    sellerEmail?: string | null;
    ownerReportEmail?: string | null;
    city: string;
    district?: string | null;
    neighborhood?: string | null;
    addressOptional?: string | null;
    price?: number | null;
    sizeM2?: number | null;
    rooms?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    floor?: string | null;
    condition?: string | null;
    parking?: string | null;
    balcony?: string | null;
    heating?: string | null;
    orientation?: string | null;
    energyRating?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    currency?: string | null;
    descriptionRaw?: string | null;
  };
};

export function ListingForm({ listing }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setSaving(true);
    setError(null);

    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(listing ? `/api/listings/${listing.id}` : "/api/listings", {
      method: listing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof json.error === "string" ? json.error : JSON.stringify(json.error ?? "Mentési hiba"));
      setSaving(false);
      return;
    }

    router.push(`/dashboard/listings/${json.id ?? listing?.id}`);
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <section>
        <h3 className="text-lg font-black">Alapadatok</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field name="title" label="Cím" defaultValue={listing?.title} required />
          <Field name="propertyType" label="Típus" defaultValue={listing?.propertyType ?? "lakás"} required />
          <Field name="city" label="Város" defaultValue={listing?.city} required />
          <Field name="district" label="Kerület / városrész" defaultValue={listing?.district ?? ""} />
          <Field name="neighborhood" label="Környék / mikro-lokáció" defaultValue={listing?.neighborhood ?? ""} />
          <Field name="addressOptional" label="Cím opcionálisan" defaultValue={listing?.addressOptional ?? ""} />
          <Field name="price" label="Ár" type="number" defaultValue={listing?.price ?? ""} />
          <Field name="currency" label="Pénznem" defaultValue={listing?.currency ?? "HUF"} />
          <Field name="sizeM2" label="Méret m²" type="number" step="0.1" defaultValue={listing?.sizeM2 ?? ""} />
          <Field name="rooms" label="Szobák" type="number" step="0.5" defaultValue={listing?.rooms ?? ""} />
          <Field name="bedrooms" label="Hálók" type="number" defaultValue={listing?.bedrooms ?? ""} />
          <Field name="bathrooms" label="Fürdők" type="number" defaultValue={listing?.bathrooms ?? ""} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-black">Értékesítési részletek</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field name="floor" label="Emelet" defaultValue={listing?.floor ?? ""} />
          <Field name="condition" label="Állapot" defaultValue={listing?.condition ?? ""} />
          <Field name="parking" label="Parkolás" defaultValue={listing?.parking ?? ""} />
          <Field name="balcony" label="Erkély / terasz" defaultValue={listing?.balcony ?? ""} />
          <Field name="heating" label="Fűtés" defaultValue={listing?.heating ?? ""} />
          <Field name="orientation" label="Tájolás" defaultValue={listing?.orientation ?? ""} />
          <Field name="energyRating" label="Energetika" defaultValue={listing?.energyRating ?? ""} />
          <Field name="latitude" label="Latitude" type="number" step="any" defaultValue={listing?.latitude ?? ""} />
          <Field name="longitude" label="Longitude" type="number" step="any" defaultValue={listing?.longitude ?? ""} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-black">Tulajdonosi riport</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field name="sellerName" label="Tulajdonos neve" defaultValue={listing?.sellerName ?? ""} />
          <Field name="sellerEmail" label="Tulajdonos email" type="email" defaultValue={listing?.sellerEmail ?? ""} />
          <Field name="ownerReportEmail" label="Riport email" type="email" defaultValue={listing?.ownerReportEmail ?? ""} />
        </div>
      </section>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Nyers leírás / belső jegyzet
        <textarea name="descriptionRaw" defaultValue={listing?.descriptionRaw ?? ""} className="min-h-36 rounded-xl border border-slate-200 px-4 py-3 font-normal" />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button disabled={saving}>{saving ? "Mentés..." : listing ? "Módosítás mentése" : "Ingatlan létrehozása"}</Button>
    </form>
  );
}

function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input {...props} className="rounded-xl border border-slate-200 px-4 py-3 font-normal" />
    </label>
  );
}
