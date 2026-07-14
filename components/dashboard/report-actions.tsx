"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReportGenerateButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/listings/${listingId}/reports/generate`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      setMessage("Riport generálási hiba.");
      return;
    }
    setMessage("Riport elkészült.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" disabled={busy} onClick={generate}>{busy ? "Generálás..." : "Riport generálása"}</Button>
      {message ? <span className="text-sm text-slate-500">{message}</span> : null}
    </div>
  );
}

export function ReportSendButton({ reportId }: { reportId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/reports/${reportId}/send`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    setMessage(res.ok ? (json.email?.sent ? "Elküldve." : "Mock küldés naplózva.") : "Küldési hiba.");
  }

  return <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={send}>{message ?? (busy ? "Küldés..." : "Küldés")}</Button>;
}
