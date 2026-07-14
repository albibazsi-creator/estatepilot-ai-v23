import { NextRequest, NextResponse } from "next/server";
import { upsertMockCalendarConnection } from "@/lib/calendar-google";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? undefined;
  const stateRaw = req.nextUrl.searchParams.get("state") ?? "";
  let state: { agencyId: string; userId: string } | null = null;
  try {
    state = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf-8"));
  } catch {
    state = null;
  }

  if (state?.agencyId && state.userId) {
    await upsertMockCalendarConnection({ agencyId: state.agencyId, userId: state.userId, code });
  }

  return NextResponse.redirect(new URL("/dashboard/calendar?google=connected-pending-token-exchange", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
