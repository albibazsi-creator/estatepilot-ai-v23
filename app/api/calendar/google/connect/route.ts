import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getGoogleCalendarAuthUrl, upsertMockCalendarConnection } from "@/lib/calendar-google";

export async function GET() {
  const { user, agency } = await getCurrentUser();
  const state = Buffer.from(JSON.stringify({ agencyId: agency.id, userId: user.id })).toString("base64url");
  const url = getGoogleCalendarAuthUrl(state);
  if (!url) {
    await upsertMockCalendarConnection({ agencyId: agency.id, userId: user.id, email: user.email });
    return NextResponse.redirect(new URL("/dashboard/calendar?google=mock", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }
  return NextResponse.redirect(url);
}
