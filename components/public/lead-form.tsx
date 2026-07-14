"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type SubmitStatus = "idle" | "loading" | "success" | "error";

type LeadResult = {
  id: string;
  score?: { score: number; temperature: string; nextBestAction?: string };
};

export function LeadForm({ slug }: { slug: string }) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [bookingStatus, setBookingStatus] = useState<SubmitStatus>("idle");
  const [lead, setLead] = useState<LeadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setStatus("loading");
    setError(null);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      buyingIntent: formData.get("buyingIntent") || undefined,
      financingType: formData.get("financingType") || undefined,
      moveTimeline: formData.get("moveTimeline") || undefined,
      message: formData.get("message") || undefined,
      gdprConsent: formData.get("gdprConsent") === "on"
    };

    const res = await fetch(`/api/public/listings/${slug}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ? JSON.stringify(json.error) : "Nem sikerült elküldeni.");
      setStatus("error");
      return;
    }

    const json = await res.json();
    setLead(json);
    setStatus("success");
  }

  async function book(formData: FormData) {
    if (!lead?.id) return;
    setBookingStatus("loading");
    setBookingError(null);

    const startValue = String(formData.get("startTime") ?? "");
    const start = new Date(startValue);
    if (Number.isNaN(start.getTime())) {
      setBookingError("Adj meg érvényes időpontot.");
      setBookingStatus("error");
      return;
    }
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    const res = await fetch(`/api/public/listings/${slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, startTime: start.toISOString(), endTime: end.toISOString() })
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setBookingError(json.error ? JSON.stringify(json.error) : "Nem sikerült időpontot foglalni.");
      setBookingStatus("error");
      return;
    }

    setBookingStatus("success");
  }

  if (status === "success" && lead) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-emerald-50 p-6 text-emerald-800">
          <div className="font-bold">Köszönjük, az érdeklődés beérkezett.</div>
          <p className="mt-2 text-sm">Az ingatlanos látja a lead pontszámot és a következő legjobb lépést.</p>
          {lead.score ? <p className="mt-2 text-sm">Demo lead score: <b>{lead.score.score}/100</b> • {lead.score.temperature}</p> : null}
        </div>

        <form action={book} className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black">Megtekintési időpont kérése</h3>
          <p className="mt-1 text-sm text-slate-500">Válassz egy időpontot. MVP-ben ez pending státuszú bookingként kerül be a dashboardba.</p>
          <input name="startTime" type="datetime-local" required className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3" />
          {bookingError ? <p className="mt-3 text-sm text-red-600">{bookingError}</p> : null}
          {bookingStatus === "success" ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">Időpontkérés beérkezett.</p> : null}
          <Button className="mt-4" disabled={bookingStatus === "loading"}>{bookingStatus === "loading" ? "Foglalás..." : "Időpont kérése"}</Button>
        </form>
      </div>
    );
  }

  return (
    <form action={submit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input name="name" required placeholder="Név" className="rounded-xl border border-slate-200 px-4 py-3" />
        <input name="phone" placeholder="Telefonszám" className="rounded-xl border border-slate-200 px-4 py-3" />
        <input name="email" type="email" placeholder="Email" className="rounded-xl border border-slate-200 px-4 py-3" />
        <select name="buyingIntent" className="rounded-xl border border-slate-200 px-4 py-3">
          <option value="">Vásárlási cél</option>
          <option>Saját célra</option>
          <option>Befektetés</option>
          <option>Kiadásra</option>
        </select>
        <select name="financingType" className="rounded-xl border border-slate-200 px-4 py-3">
          <option value="">Finanszírozás</option>
          <option>Készpénz</option>
          <option>Hitel</option>
          <option>Még nem tudom</option>
        </select>
        <select name="moveTimeline" className="rounded-xl border border-slate-200 px-4 py-3">
          <option value="">Mikor költözne?</option>
          <option>Azonnal / 1 hónapon belül</option>
          <option>1–3 hónap</option>
          <option>3+ hónap</option>
        </select>
      </div>
      <textarea name="message" placeholder="Kérdés vagy üzenet" className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3" />
      <label className="flex gap-3 text-sm text-slate-600">
        <input name="gdprConsent" type="checkbox" required className="mt-1" />
        Hozzájárulok, hogy az ingatlanos kapcsolatfelvétel céljából kezelje az adataimat.
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button disabled={status === "loading"}>{status === "loading" ? "Küldés..." : "Érdeklődöm / időpontot kérek"}</Button>
    </form>
  );
}
