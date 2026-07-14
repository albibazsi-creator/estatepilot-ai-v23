import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export function getGoogleCalendarAuthUrl(state: string) {
  if (!env.GOOGLE_CALENDAR_CLIENT_ID || !env.GOOGLE_CALENDAR_REDIRECT_URI) {
    return null;
  }
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CALENDAR_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALENDAR_REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/calendar.events",
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function upsertMockCalendarConnection(input: { agencyId: string; userId: string; email?: string; code?: string }) {
  return prisma.calendarConnection.upsert({
    where: { agencyId_userId_provider: { agencyId: input.agencyId, userId: input.userId, provider: "google" } },
    update: {
      status: input.code ? "oauth_code_received" : "mock",
      externalAccountEmail: input.email,
      metadataJson: { codeReceived: Boolean(input.code), note: "Token exchange adapter pending" },
      connectedAt: new Date()
    },
    create: {
      agencyId: input.agencyId,
      userId: input.userId,
      provider: "google",
      status: input.code ? "oauth_code_received" : "mock",
      externalAccountEmail: input.email,
      metadataJson: { codeReceived: Boolean(input.code), note: "Token exchange adapter pending" },
      connectedAt: new Date()
    }
  });
}
