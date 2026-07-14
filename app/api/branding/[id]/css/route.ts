import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildBrandCss } from "@/lib/branding";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const profile = await prisma.agencyBrandingProfile.findUnique({ where: { id: params.id } });
  if (!profile) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(buildBrandCss(profile), { headers: { "content-type": "text/css; charset=utf-8" } });
}
