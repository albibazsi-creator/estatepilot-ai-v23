"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Tour = {
  id: string;
  tourType: string;
  provider?: string | null;
  embedUrl?: string | null;
};

type Media = {
  id: string;
  mediaType: string;
  url: string;
  roomLabel?: string | null;
};

export function TourViewer({ tours, panoramas }: { tours: Tour[]; panoramas: Media[] }) {
  const [activePanorama, setActivePanorama] = useState(panoramas[0]?.url);
  const embed = tours.find((tour) => tour.embedUrl);

  if (embed?.embedUrl) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950">
        <iframe
          src={embed.embedUrl}
          title="3D/360 tour"
          className="h-[460px] w-full"
          allow="fullscreen; xr-spatial-tracking"
        />
      </div>
    );
  }

  if (activePanorama) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-white">
          <img src={activePanorama} alt="360 panoráma" className="h-full w-full object-cover opacity-80" />
          <div className="absolute bottom-4 left-4 rounded-2xl bg-black/60 px-4 py-2 text-sm backdrop-blur">
            MVP 360 nézet: panoráma kép előnézet. V2-ben hotspot editor és teljes Pannellum/Marzipano viewer.
          </div>
        </div>
        {panoramas.length > 1 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {panoramas.map((p) => (
              <Button key={p.id} variant={p.url === activePanorama ? "primary" : "secondary"} size="sm" onClick={() => setActivePanorama(p.url)}>
                {p.roomLabel ?? "Szoba"}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      Nincs még 3D/360 túra. Adj hozzá Matterport/iframe linket vagy panoráma képet.
    </div>
  );
}
