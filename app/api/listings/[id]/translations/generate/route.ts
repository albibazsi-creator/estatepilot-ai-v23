import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isSupportedLocale, listingDisclosure, translateListingMock } from "@/lib/i18n";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { agency } = await getCurrentUser();
  const locale = req.nextUrl.searchParams.get("locale") || "en";
  if (!isSupportedLocale(locale)) return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  const listing = await prisma.listing.findFirst({ where: { id: params.id, agencyId: agency.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  const output = translateListingMock(listing, locale);
  const translation = await prisma.listingTranslation.upsert({
    where: { listingId_locale: { listingId: listing.id, locale } },
    update: { title: output.title, description: output.description, shortHook: output.shortHook, highlightsJson: output.highlights, disclosureText: listingDisclosure(locale), status: "ready" },
    create: { agencyId: agency.id, listingId: listing.id, locale, title: output.title, description: output.description, shortHook: output.shortHook, highlightsJson: output.highlights, disclosureText: listingDisclosure(locale), status: "ready" }
  });
  return NextResponse.json({ translation });
}
