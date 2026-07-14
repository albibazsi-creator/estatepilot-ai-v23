"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "assistant"; text: string };

export function PropertyChat({ slug }: { slug: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Kérdezz az ingatlanról. Csak a hirdetésben szereplő adatokból válaszolok." }
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    const res = await fetch(`/api/public/listings/${slug}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    });
    const json = await res.json().catch(() => ({ answer: "Nem sikerült válaszolni." }));
    setMessages((m) => [...m, { role: "assistant", text: json.answer ?? json.error ?? "Nincs válasz." }]);
    setLoading(false);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "assistant" ? "rounded-2xl bg-slate-100 p-3 text-sm" : "ml-auto rounded-2xl bg-slate-950 p-3 text-sm text-white"}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Pl. Van erkély? Mekkora a lakás?"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
        <Button onClick={ask} disabled={loading}>{loading ? "..." : "Kérdés"}</Button>
      </div>
    </div>
  );
}
