"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CalendarSlotForm({ listings }: { listings: Array<{ id: string; title: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/calendar/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) setError("Nem sikerült menteni az időpont slotot.");
    setLoading(false);
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5">
      <select name="listingId" className="rounded-xl border border-slate-200 px-4 py-3 text-sm md:col-span-2">
        <option value="">Általános slot</option>
        {listings.map((listing) => <option key={listing.id} value={listing.id}>{listing.title}</option>)}
      </select>
      <input name="startTime" type="datetime-local" required className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
      <input name="endTime" type="datetime-local" required className="rounded-xl border border-slate-200 px-4 py-3 text-sm" />
      <Button disabled={loading}>{loading ? "Mentés..." : "Slot létrehozás"}</Button>
      {error ? <p className="text-sm text-red-600 md:col-span-5">{error}</p> : null}
    </form>
  );
}
