"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  leadId: string;
  currentStatus: string;
};

export function LeadActions({ leadId, currentStatus }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ subject: string; body: string; channel: string } | null>(null);

  async function setStatus(status: string) {
    setBusy(status);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setBusy(null);
    router.refresh();
  }

  async function recalc() {
    setBusy("score");
    await fetch(`/api/leads/${leadId}/recalculate-score`, { method: "POST" });
    setBusy(null);
    router.refresh();
  }

  async function followUp() {
    setBusy("followup");
    const res = await fetch(`/api/leads/${leadId}/follow-up`, { method: "POST" });
    const json = await res.json();
    setDraft(json.draft);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-black">Lead kezelése</h2>
        <p className="text-sm text-slate-500">Jelenlegi státusz: <b>{currentStatus}</b></p>
      </div>
      <div className="flex flex-wrap gap-2">
        {['NEW', 'CONTACTED', 'BOOKED', 'OFFER', 'LOST', 'WON'].map((status) => (
          <Button key={status} type="button" size="sm" variant={status === currentStatus ? "primary" : "secondary"} disabled={!!busy} onClick={() => setStatus(status)}>
            {status}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={!!busy} onClick={recalc}>Score újraszámítás</Button>
        <Button type="button" variant="secondary" disabled={!!busy} onClick={followUp}>Follow-up draft</Button>
      </div>
      {draft ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="font-black">{draft.subject}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">Javasolt csatorna: {draft.channel}</div>
          <pre className="mt-3 whitespace-pre-wrap font-sans leading-6 text-slate-700">{draft.body}</pre>
        </div>
      ) : null}
    </div>
  );
}
