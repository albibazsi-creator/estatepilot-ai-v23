import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { escapeHtml } from "@/lib/sanitize";

export type EmailPayload = {
  to?: string | null;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (!payload.to) {
    return { sent: false, provider: "none", reason: "missing_recipient" };
  }

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    console.log("[email:mock]", payload.subject, payload.to);
    return { sent: false, provider: "mock", reason: "RESEND_API_KEY or RESEND_FROM_EMAIL missing" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Resend email failed", error);
    return { sent: false, provider: "resend", error };
  }

  const data = await res.json();
  return { sent: true, provider: "resend", data };
}

export async function sendTrackedEmail(input: EmailPayload & { agencyId: string; listingId?: string; leadId?: string }) {
  const log = await prisma.notificationLog.create({
    data: {
      agencyId: input.agencyId,
      listingId: input.listingId,
      leadId: input.leadId,
      channel: "email",
      to: input.to ?? "",
      subject: input.subject,
      status: input.to ? "PENDING" : "SKIPPED",
      payloadJson: { html: input.html, text: input.text }
    }
  });

  if (!input.to) return { sent: false, provider: "none", logId: log.id, reason: "missing_recipient" };

  const result = await sendEmail(input);
  await prisma.notificationLog.update({
    where: { id: log.id },
    data: {
      status: result.sent ? "SENT" : result.provider === "mock" ? "SKIPPED" : "FAILED",
      provider: result.provider,
      providerResponse: result as object,
      error: "error" in result ? String(result.error) : undefined,
      sentAt: result.sent ? new Date() : undefined
    }
  });

  return { ...result, logId: log.id };
}

export function leadNotificationHtml(input: { leadName: string; listingTitle: string; score: number; message?: string | null; phone?: string | null; email?: string | null }) {
  return `
    <h1>Új érdeklődő érkezett</h1>
    <p><b>Ingatlan:</b> ${escapeHtml(input.listingTitle)}</p>
    <p><b>Lead:</b> ${escapeHtml(input.leadName)}</p>
    <p><b>Pontszám:</b> ${escapeHtml(input.score)}/100</p>
    <p><b>Telefon:</b> ${escapeHtml(input.phone ?? "nincs megadva")}</p>
    <p><b>Email:</b> ${escapeHtml(input.email ?? "nincs megadva")}</p>
    ${input.message ? `<p><b>Üzenet:</b> ${escapeHtml(input.message)}</p>` : ""}
  `;
}

export function appointmentNotificationHtml(input: { leadName: string; listingTitle: string; startTime: Date; endTime: Date }) {
  return `
    <h1>Új megtekintési időpont</h1>
    <p><b>Ingatlan:</b> ${escapeHtml(input.listingTitle)}</p>
    <p><b>Érdeklődő:</b> ${escapeHtml(input.leadName)}</p>
    <p><b>Időpont:</b> ${escapeHtml(input.startTime.toLocaleString("hu-HU"))} – ${escapeHtml(input.endTime.toLocaleString("hu-HU"))}</p>
  `;
}
