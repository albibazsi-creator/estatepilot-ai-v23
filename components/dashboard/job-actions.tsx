"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EnqueueJobButton({ type, listingId, label, priority = 60 }: { type: string; listingId?: string; label: string; priority?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function click() {
    setLoading(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, listingId, priority })
    });
    setLoading(false);
    router.refresh();
  }

  return <Button type="button" variant="secondary" size="sm" onClick={click} disabled={loading}>{loading ? "Sorba állítva..." : label}</Button>;
}

export function ProcessJobButton({ jobId, label = "Futtatás" }: { jobId?: string; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function click() {
    setLoading(true);
    await fetch("/api/jobs/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobId ? { jobId } : {})
    });
    setLoading(false);
    router.refresh();
  }

  return <Button type="button" size="sm" onClick={click} disabled={loading}>{loading ? "Fut..." : label}</Button>;
}
