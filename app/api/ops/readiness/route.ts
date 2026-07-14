import { NextResponse } from "next/server";
import { buildReleaseReadiness } from "@/lib/release-readiness";

export async function GET() {
  return NextResponse.json(await buildReleaseReadiness());
}
