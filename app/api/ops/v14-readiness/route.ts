import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getV14Readiness } from "@/lib/v14-readiness";

export async function GET() {
  const { agency } = await getCurrentUser();
  const readiness = await getV14Readiness(agency.id);
  return NextResponse.json(readiness);
}
