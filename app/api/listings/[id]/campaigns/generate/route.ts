import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { generateMarketingCampaign } from "@/lib/ai";
import { audit } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, agency } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findFirst({ where: { id, agencyId: agency.id }, include: { media: true, aiOutputs: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const plan = await generateMarketingCampaign(listing);
  const campaign = await prisma.marketingCampaign.create({
    data: {
      agencyId: agency.id,
      listingId: listing.id,
      name: typeof plan === "object" && plan && "campaign_name" in plan ? String((plan as { campaign_name?: unknown }).campaign_name ?? `${listing.title} kampány`) : `${listing.title} kampány`,
      objective: "lead_generation",
      status: "READY",
      audienceJson: typeof plan === "object" && plan && "audiences" in plan ? ((plan as { audiences?: object }).audiences as object | undefined) : undefined,
      assetsJson: plan as object,
      budgetSuggestionJson: typeof plan === "object" && plan && "budget_suggestion" in plan ? ((plan as { budget_suggestion?: object }).budget_suggestion as object | undefined) : undefined
    }
  });

  await prisma.aiOutput.create({ data: { listingId: listing.id, outputType: "campaign_plan", contentJson: plan as object, modelUsed: "direct" } });
  await audit("campaign_generated", "MarketingCampaign", campaign.id, { listingId: listing.id }, user.id);
  return NextResponse.json({ campaign, plan }, { status: 201 });
}
