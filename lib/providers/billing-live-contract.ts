export const billingLiveContract = {
  supportedProviders: ["Stripe", "Barion", "manual_pilot_invoice"],
  requiredForPaidLaunch: ["checkout_session", "webhook_signature", "subscription_status_sync", "plan_limit_enforcement", "invoice_record"],
  pilotAllowedFallback: "manual_pilot_invoice"
} as const;
