"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type TourNode = { id: string; roomName: string; panoramaUrl?: string | null; sortOrder: number };
type TourHotspot = { id: string; label: string; fromNodeId: string; toNodeId?: string | null };
type Tour = {
  id: string;
  tourType: string;
  provider?: string | null;
  embedUrl?: string | null;
  nodes?: TourNode[];
  hotspots?: TourHotspot[];
};

export function TourForm({ listingId, tours = [] }: { listingId: string; tours?: Tour[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    await fetch(`/api/listings/${listingId}/tours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tourType: formData.get("tourType"),
        provider: formData.get("provider") || undefined,
        embedUrl: formData.get("embedUrl") || undefined
      })
    });
    setLoading(false);
    router.refresh();
  }

  async function addNode(tourId: string, formData: FormData) {
    setLoading(true);
    await fetch(`/api/tours/${tourId}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: formData.get("roomName"),
        panoramaUrl: formData.get("panoramaUrl") || undefined,
        sortOrder: Number(formData.get("sortOrder") || 0)
      })
    });
    setLoading(false);
    router.refresh();
  }

  async function addHotspot(tourId: string, formData: FormData) {
    setLoading(true);
    await fetch(`/api/tours/${tourId}/hotspots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromNodeId: formData.get("fromNodeId"),
        toNodeId: formData.get("toNodeId") || undefined,
        label: formData.get("label"),
        yaw: formData.get("yaw") || undefined,
        pitch: formData.get("pitch") || undefined
      })
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <form action={submit}>
        <h3 className="text-lg font-bold">3D / 360 tour embed</h3>
        <p className="mt-1 text-sm text-slate-500">Matterport vagy bármilyen iframe-kompatibilis tour link. V2 előkészítés: room node + hotspot adatmodell.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select name="tourType" className="rounded-xl border border-slate-200 px-3 py-2">
            <option value="MATTERPORT">Matterport</option>
            <option value="IFRAME">Iframe</option>
            <option value="PANORAMA_360">360</option>
            <option value="CUSTOM_360">Saját 360 tour</option>
          </select>
          <input name="provider" placeholder="Provider" className="rounded-xl border border-slate-200 px-3 py-2" />
          <input name="embedUrl" placeholder="Embed URL" className="rounded-xl border border-slate-200 px-3 py-2 md:col-span-2" />
        </div>
        <div className="mt-4"><Button disabled={loading}>{loading ? "Mentés..." : "Tour mentése"}</Button></div>
      </form>

      {tours.length ? (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="font-black">Mentett tourök / V2 node-háló</h4>
          {tours.map((tour) => (
            <details key={tour.id} className="rounded-2xl border border-slate-200 p-4">
              <summary className="cursor-pointer font-bold">{tour.tourType} • {tour.provider ?? "nincs provider"}</summary>
              {tour.embedUrl ? <p className="mt-2 break-all text-sm text-slate-500">{tour.embedUrl}</p> : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <form action={(fd) => addNode(tour.id, fd)} className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-bold">Room node hozzáadása</div>
                  <div className="mt-3 grid gap-2">
                    <input name="roomName" required placeholder="Pl. Nappali" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                    <input name="panoramaUrl" placeholder="Panoráma URL opcionális" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                    <input name="sortOrder" type="number" placeholder="Sorrend" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                    <Button size="sm" variant="secondary" disabled={loading}>Node mentése</Button>
                  </div>
                </form>

                <form action={(fd) => addHotspot(tour.id, fd)} className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-bold">Hotspot hozzáadása</div>
                  <div className="mt-3 grid gap-2">
                    <select name="fromNodeId" required className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                      <option value="">Honnan?</option>
                      {(tour.nodes ?? []).map((node) => <option key={node.id} value={node.id}>{node.roomName}</option>)}
                    </select>
                    <select name="toNodeId" className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                      <option value="">Hova? opcionális</option>
                      {(tour.nodes ?? []).map((node) => <option key={node.id} value={node.id}>{node.roomName}</option>)}
                    </select>
                    <input name="label" required placeholder="Pl. Tovább a konyhába" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input name="yaw" placeholder="Yaw" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                      <input name="pitch" placeholder="Pitch" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                    <Button size="sm" variant="secondary" disabled={loading || !(tour.nodes ?? []).length}>Hotspot mentése</Button>
                  </div>
                </form>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-sm font-bold">Room node-ok</div>
                  <div className="mt-2 space-y-2">
                    {(tour.nodes ?? []).map((node) => <div key={node.id} className="rounded-xl bg-slate-50 p-3 text-sm">{node.roomName}</div>)}
                    {!(tour.nodes ?? []).length ? <p className="text-sm text-slate-500">Még nincs node.</p> : null}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold">Hotspotok</div>
                  <div className="mt-2 space-y-2">
                    {(tour.hotspots ?? []).map((hotspot) => <div key={hotspot.id} className="rounded-xl bg-slate-50 p-3 text-sm">{hotspot.label}</div>)}
                    {!(tour.hotspots ?? []).length ? <p className="text-sm text-slate-500">Még nincs hotspot.</p> : null}
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </div>
  );
}
