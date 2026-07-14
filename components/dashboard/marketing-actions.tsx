"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GenerateCampaignButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/listings/${listingId}/campaigns/generate`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Kampánycsomag elkészült." : json.error ?? "Hiba történt.");
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={run} disabled={loading}>{loading ? "Generálás..." : "AI kampánycsomag"}</Button>
      <Button href={`/api/listings/${listingId}/export-package`} variant="secondary">Export package JSON</Button>
      {message ? <span className="text-sm text-slate-500">{message}</span> : null}
    </div>
  );
}
