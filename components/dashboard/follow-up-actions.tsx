"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TaskStatusButton({ taskId, status, label }: { taskId: string; status: string; label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update() {
    setLoading(true);
    await fetch(`/api/follow-ups/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setLoading(false);
    router.refresh();
  }

  return <Button onClick={update} disabled={loading} size="sm" variant="secondary">{loading ? "..." : label}</Button>;
}

export function GenerateLeadTasksButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, generateFromLead: true })
    });
    setLoading(false);
    router.refresh();
  }

  return <Button onClick={generate} disabled={loading} size="sm">{loading ? "..." : "Task generálás"}</Button>;
}
