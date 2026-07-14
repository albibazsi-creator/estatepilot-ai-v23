import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { slugify } from "@/lib/slug";
import { listingSchema } from "@/lib/validators";
import { audit } from "@/lib/audit";

export async function GET() {
  const { agency } = await getCurrentUser();
  const listings = await prisma.listing.findMany({ where: { agencyId: agency.id }, include: { media: true, leads: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const { user, agency } = await getCurrentUser();
  const body = await req.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const baseSlug = slugify(`${parsed.data.city}-${parsed.data.district ?? ""}-${parsed.data.title}`);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.listing.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const listing = await prisma.listing.create({
    data: {
      ...parsed.data,
      slug,
      agencyId: agency.id,
      agentId: user.id
    }
  });
  await audit("listing_created", "Listing", listing.id, { slug }, user.id);
  return NextResponse.json(listing, { status: 201 });
}
