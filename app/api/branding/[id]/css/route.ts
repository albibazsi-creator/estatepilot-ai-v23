import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildBrandCss } from "@/lib/branding";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const profile = await prisma.agencyBrandingProfile.findUnique({
    where: { id }
  });

  if (!profile) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(buildBrandCss(profile), {
    headers: { "content-type": "text/css; charset=utf-8" }
  });
}
