"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RunProviderCheckButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    await fetch("/api/providers/health", { method: "POST" });
    setLoading(false);
    router.refresh();
  }
  return <Button onClick={run} disabled={loading} variant="secondary">{loading ? "Ellenőrzés..." : "Provider check futtatás"}</Button>;
}

export function RunAcceptanceButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    await fetch("/api/acceptance-tests/run", { method: "POST" });
    setLoading(false);
    router.refresh();
  }
  return <Button onClick={run} disabled={loading}>{loading ? "Acceptance fut..." : "Acceptance suite futtatás"}</Button>;
}
