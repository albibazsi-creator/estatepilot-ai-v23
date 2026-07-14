import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const provider = req.headers.get("x-estatepilot-provider") ?? "manual";
  const signature = req.headers.get("x-estatepilot-signature");
  const payload = await req.json().catch(() => ({}));

  if (env.WEBHOOK_SECRET && signature !== env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = await prisma.webhookEvent.create({
    data: {
      provider,
      eventType: typeof payload.type === "string" ? payload.type : "billing.event",
      externalId: typeof payload.id === "string" ? payload.id : undefined,
      payloadJson: payload as object,
      status: "RECEIVED"
    }
  });

  return NextResponse.json({ received: true, eventId: event.id });
}
