import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getErrorTaxonomySummary } from "@/lib/error-taxonomy";

export async function GET() {
  const { agency } = await getCurrentUser();
  return NextResponse.json(await getErrorTaxonomySummary(agency.id));
}
