"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AiActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: string, label: string) {
    setBusy(label);
    await fetch(`/api/listings/${listingId}/ai/${action}`, { method: "POST" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
      <h3 className="text-lg font-bold">AI generátorok</h3>
      <p className="mt-1 text-sm text-slate-300">Kulcs nélkül demo szöveget ad, OPENAI_API_KEY esetén valódi generálást hív.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => run("generate-description", "Leírás")} disabled={!!busy}>AI leírás</Button>
        <Button variant="secondary" onClick={() => run("generate-social-posts", "Social")} disabled={!!busy}>Social posztok</Button>
        <Button variant="secondary" onClick={() => run("generate-reels-script", "Reels")} disabled={!!busy}>Reels script</Button>
        <Button variant="secondary" onClick={() => run("generate-faq", "FAQ")} disabled={!!busy}>FAQ</Button>
        <Button variant="secondary" onClick={() => run("analyze-listing-score", "Listing score")} disabled={!!busy}>Listing score</Button>
        <Button variant="secondary" onClick={() => run("generate-staging-plan", "Staging terv")} disabled={!!busy}>Staging terv</Button>
      </div>
      {busy ? <p className="mt-3 text-sm text-slate-300">Fut: {busy}...</p> : null}
    </div>
  );
}
