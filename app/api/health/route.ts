import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "up",
      storage: env.STORAGE_DRIVER,
      ai: env.OPENAI_API_KEY ? "configured" : "mock",
      email: env.RESEND_API_KEY ? "configured" : "mock",
      latencyMs: Date.now() - startedAt
    });
  } catch (error) {
    return NextResponse.json({ ok: false, database: "down", error: error instanceof Error ? error.message : "unknown" }, { status: 500 });
  }
}
