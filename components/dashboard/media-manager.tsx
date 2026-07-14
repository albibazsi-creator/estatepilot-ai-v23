"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";

export type DashboardMedia = {
  id: string;
  mediaType: string;
  url: string;
  roomLabel?: string | null;
  qualityScore?: number | null;
  isCover: boolean;
  isStaged?: boolean | null;
  disclosureRequired?: boolean | null;
};

export function MediaManager({ listingId, media }: { listingId: string; media: DashboardMedia[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function withRefresh(task: () => Promise<Response | void>, success: string) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await task();
      if (res && !res.ok) {
        const json = await res.json().catch(() => ({}));
        setMessage(json.error ? JSON.stringify(json.error) : "Hiba történt.");
      } else {
        setMessage(success);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(formData: FormData) {
    await withRefresh(
      () => fetch(`/api/listings/${listingId}/media/upload`, { method: "POST", body: formData }),
      "Fájl feltöltve."
    );
  }

  async function addUrl(formData: FormData) {
    await withRefresh(
      () => fetch(`/api/listings/${listingId}/media/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formData.get("url"),
          thumbnailUrl: formData.get("thumbnailUrl") || undefined,
          roomLabel: formData.get("roomLabel") || undefined,
          mediaType: formData.get("mediaType") || "IMAGE",
          isCover: formData.get("isCover") === "on",
          sortOrder: Number(formData.get("sortOrder") || 0)
        })
      }),
      "URL hozzáadva."
    );
  }

  async function analyze() {
    await withRefresh(
      () => fetch(`/api/listings/${listingId}/media/analyze`, { method: "POST" }),
      "AI képelemzés lefutott."
    );
  }

  async function setCover(mediaId: string) {
    await withRefresh(
      () => fetch(`/api/media/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCover: true })
      }),
      "Borítókép beállítva."
    );
  }

  async function remove(mediaId: string) {
    if (!confirm("Biztosan törlöd ezt a médiaelemet?")) return;
    await withRefresh(
      () => fetch(`/api/media/${mediaId}`, { method: "DELETE" }),
      "Média törölve."
    );
  }

  async function updateLabel(mediaId: string, roomLabel: string) {
    await withRefresh(
      () => fetch(`/api/media/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomLabel })
      }),
      "Címke frissítve."
    );
  }

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Média / képek / alaprajz</h3>
          <p className="text-sm text-slate-500">Most már működik helyi fájlfeltöltéssel is. Demohoz elég, produkcióban ezt R2/S3-ra érdemes cserélni.</p>
        </div>
        <Button variant="secondary" onClick={analyze} disabled={loading}>AI képelemzés</Button>
      </div>

      <form action={uploadFile} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Fájl feltöltése</label>
          <input name="file" type="file" required accept="image/*,video/mp4,application/pdf" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>
        <Field name="roomLabel" placeholder="Szoba címke" />
        <select name="mediaType" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="IMAGE">Kép</option>
          <option value="PANORAMA_360">360 panoráma</option>
          <option value="FLOORPLAN">Alaprajz</option>
          <option value="VIDEO">Videó</option>
        </select>
        <Button disabled={loading}>Feltöltés</Button>
        <label className="flex items-center gap-2 text-sm text-slate-600 md:col-span-5">
          <input name="isCover" type="checkbox" /> Borítókép legyen
        </label>
      </form>

      <details className="rounded-2xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-bold">Külső URL / Matterport előkészítéshez média hozzáadása</summary>
        <form action={addUrl} className="mt-4 grid gap-3 md:grid-cols-5">
          <input name="url" required placeholder="https://..." className="rounded-xl border border-slate-200 px-3 py-2 md:col-span-2" />
          <Field name="roomLabel" placeholder="Szoba címke" />
          <select name="mediaType" className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="IMAGE">Kép</option>
            <option value="PANORAMA_360">360 panoráma</option>
            <option value="FLOORPLAN">Alaprajz</option>
            <option value="VIDEO">Videó</option>
          </select>
          <Button disabled={loading}>URL hozzáadás</Button>
          <label className="flex items-center gap-2 text-sm text-slate-600 md:col-span-5">
            <input name="isCover" type="checkbox" /> Borítókép legyen
          </label>
        </form>
      </details>

      {message ? <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{message}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {media.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <MediaPreview media={m} />
            <div className="space-y-3 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold">{m.roomLabel ?? "Nincs címke"}</div>
                  <div className="text-slate-500">{m.mediaType} {m.qualityScore ? `• AI score: ${m.qualityScore}` : ""}</div>
                </div>
                {m.isCover ? <div className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">Cover</div> : null}
              </div>
              {m.isStaged || m.disclosureRequired ? <div className="rounded-xl bg-amber-50 p-2 text-xs font-semibold text-amber-800">AI látványterv jelölés szükséges</div> : null}
              <form action={(fd) => updateLabel(m.id, String(fd.get("roomLabel") ?? ""))} className="flex gap-2">
                <input name="roomLabel" defaultValue={m.roomLabel ?? ""} placeholder="Új címke" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <Button size="sm" variant="secondary" disabled={loading}>Ment</Button>
              </form>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => setCover(m.id)} disabled={loading || m.isCover}>Cover</Button>
                <Button type="button" size="sm" variant="danger" onClick={() => remove(m.id)} disabled={loading}>Törlés</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />;
}

function MediaPreview({ media }: { media: DashboardMedia }) {
  if (media.mediaType === "VIDEO") {
    return <video src={media.url} controls className="h-36 w-full bg-slate-950 object-cover" />;
  }

  if (media.mediaType === "FLOORPLAN" && media.url.toLowerCase().endsWith(".pdf")) {
    return (
      <div className="flex h-36 items-center justify-center bg-slate-100 text-sm font-bold text-slate-600">
        PDF alaprajz
      </div>
    );
  }

  return <img src={media.url} alt={media.roomLabel ?? "Listing media"} className="h-36 w-full object-cover" />;
}
