"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type EventType = "page_view" | "gallery_view" | "tour_open" | "tour_complete" | "floorplan_open" | "call_clicked";

async function postEvent(slug: string, eventType: EventType, metadata?: Record<string, unknown>) {
  await fetch(`/api/public/listings/${slug}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, metadata })
  }).catch(() => null);
}

export function EventTracker({ slug, eventType, metadata }: { slug: string; eventType: EventType; metadata?: Record<string, unknown> }) {
  useEffect(() => {
    postEvent(slug, eventType, metadata);
  }, [slug, eventType, metadata]);

  return null;
}

export function EventOnView({ slug, eventType, children }: { slug: string; eventType: EventType; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (!ref.current || fired.current) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && !fired.current) {
        fired.current = true;
        postEvent(slug, eventType);
        observer.disconnect();
      }
    }, { threshold: 0.25 });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [slug, eventType]);

  return <div ref={ref}>{children}</div>;
}
