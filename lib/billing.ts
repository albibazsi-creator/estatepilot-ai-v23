import { randomUUID } from "crypto";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const plans = [
  { code: "starter_listing", name: "Starter / ingatlan", priceHuf: 19900, interval: "once", activeListings: 1 },
  { code: "pro_listing", name: "Pro / ingatlan", priceHuf: 49900, interval: "once", activeListings: 1 },
  { code: "premium_listing", name: "Premium / ingatlan", priceHuf: 99900, interval: "once", activeListings: 1 },
  { code: "solo_monthly", name: "Solo Agent", priceHuf: 39900, interval: "month", activeListings: 3 },
  { code: "pro_monthly", name: "Pro Agent", priceHuf: 89900, interval: "month", activeListings: 10 },
  { code: "agency_monthly", name: "Agency", priceHuf: 199000, interval: "month", activeListings: 50 }
] as const;

export type PlanCode = (typeof plans)[number]["code"];

export function getPlan(code: string) {
  const plan = plans.find((item) => item.code === code);
  if (!plan) throw new Error("Unknown billing plan");
  return plan;
}

export async function createCheckout(input: { agencyId: string; planCode: string; listingId?: string | null; successUrl?: string; cancelUrl?: string }) {
  const plan = getPlan(input.planCode);
  const provider = env.STRIPE_SECRET_KEY ? "stripe" : env.BARION_POS_KEY ? "barion" : "manual";
  const externalPaymentId = `${provider}_${randomUUID()}`;
  const checkoutUrl = provider === "manual"
    ? `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?manual=${plan.code}`
    : `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=${externalPaymentId}&provider=${provider}`;

  const record = await prisma.paymentRecord.create({
    data: {
      agencyId: input.agencyId,
      listingId: input.listingId ?? null,
      provider,
      externalPaymentId,
      checkoutUrl,
      plan: plan.code,
      amount: plan.priceHuf,
      currency: "HUF",
      status: provider === "manual" ? "manual_pending" : "created",
      metadataJson: {
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        note: provider === "manual" ? "Éles fizetéshez Stripe/Barion adaptert kell bekötni." : "Provider adapter skeleton."
      }
    }
  });

  return { provider, plan, checkoutUrl, paymentRecordId: record.id, status: record.status };
}

export async function markPaymentWebhook(input: { provider: string; eventType: string; externalId?: string; payload: unknown }) {
  return prisma.paymentRecord.updateMany({
    where: { provider: input.provider, externalPaymentId: input.externalId },
    data: { status: input.eventType.includes("paid") || input.eventType.includes("succeeded") ? "paid" : "webhook_received", metadataJson: input.payload as any }
  });
}
