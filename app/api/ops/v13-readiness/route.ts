import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getV13Readiness } from "@/lib/v13-readiness";

export async function GET() {
  const { agency } = await getCurrentUser();
  const readiness = await getV13Readiness(agency.id);
  return NextResponse.json(readiness);
}
