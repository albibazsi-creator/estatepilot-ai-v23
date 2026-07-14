import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { analyzeListingImages, generateListingDescription, generateReelsScript, generateSellerReportSummary, generateSocialContent, generateMarketingCampaign } from "@/lib/ai";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { calculateListingReadiness } from "@/lib/readiness";
import { buildFollowUpTasksForLead } from "@/lib/follow-up";
import { buildPropertyKnowledgeBase } from "@/lib/knowledge";

type EnqueueJobInput = {
  agencyId: string;
  listingId?: string | null;
  type: string;
  priority?: number;
  payload?: object | null;
};

export async function enqueueJob(input: EnqueueJobInput) {
  return prisma.aiJob.create({
    data: {
      agencyId: input.agencyId,
      listingId: input.listingId ?? undefined,
      type: input.type,
      priority: input.priority ?? 50,
      payload: input.payload ?? undefined
    }
  });
}

export async function claimNextJob(agencyId?: string) {
  const job = await prisma.aiJob.findFirst({
    where: {
      status: "PENDING",
      ...(agencyId ? { agencyId } : {})
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }]
  });

  if (!job) return null;

  return prisma.aiJob.update({
    where: { id: job.id },
    data: { status: "RUNNING", lockedAt: new Date(), attempts: { increment: 1 } }
  });
}

export async function runJob(jobId: string) {
  const job = await prisma.aiJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  try {
    let result: unknown = { ok: true };

    if (job.type === "analyze_images") {
      if (!job.listingId) throw new Error("listingId required");
      const listing = await prisma.listing.findUniqueOrThrow({ where: { id: job.listingId }, include: { media: true, tours: true, floorplans: true } });
      const analysis = await analyzeListingImages(listing, listing.media);
      await prisma.aiOutput.create({ data: { listingId: listing.id, outputType: "image_analysis", contentJson: analysis as object, modelUsed: "workflow" } });
      const readiness = calculateListingReadiness(listing);
      await prisma.listing.update({ where: { id: listing.id }, data: { aiReadinessScore: readiness.score } });
      result = { analysis, readiness };
    }

    if (job.type === "generate_listing_bundle") {
      if (!job.listingId) throw new Error("listingId required");
      const listing = await prisma.listing.findUniqueOrThrow({ where: { id: job.listingId }, include: { media: true, aiOutputs: { orderBy: { createdAt: "desc" }, take: 5 } } });
      const imageAnalysis = listing.aiOutputs.find((o) => o.outputType === "image_analysis")?.contentJson;
      const [description, social, reels] = await Promise.all([
        generateListingDescription(listing, imageAnalysis),
        generateSocialContent(listing, imageAnalysis),
        generateReelsScript(listing)
      ]);
      await prisma.$transaction([
        prisma.aiOutput.create({ data: { listingId: listing.id, outputType: "listing_description", contentJson: description as object, modelUsed: "workflow" } }),
        prisma.aiOutput.create({ data: { listingId: listing.id, outputType: "social_content", contentJson: social as object, modelUsed: "workflow" } }),
        prisma.aiOutput.create({ data: { listingId: listing.id, outputType: "reels_script", contentJson: reels as object, modelUsed: "workflow" } }),
        prisma.listing.update({ where: { id: listing.id }, data: { descriptionAi: typeof description === "object" && description && "long_description" in description ? String((description as { long_description?: unknown }).long_description ?? "") : undefined } })
      ]);
      result = { description, social, reels };
    }

    if (job.type === "recalculate_leads") {
      const leads = await prisma.lead.findMany({
        where: job.listingId ? { listingId: job.listingId } : { listing: { agencyId: job.agencyId } },
        include: { events: true }
      });
      const updated = [];
      for (const lead of leads) {
        const score = calculateLeadScore(lead);
        updated.push(await prisma.lead.update({ where: { id: lead.id }, data: { leadScore: score.score, aiSummary: `${score.temperature}: ${score.reason}. Következő lépés: ${score.nextBestAction}` } }));
      }
      result = { updated: updated.length };
    }

    if (job.type === "generate_seller_report") {
      if (!job.listingId) throw new Error("listingId required");
      const periodEnd = new Date();
      const periodStart = new Date(periodEnd);
      periodStart.setDate(periodStart.getDate() - 7);
      const [listing, events, leads, appointments] = await Promise.all([
        prisma.listing.findUniqueOrThrow({ where: { id: job.listingId } }),
        prisma.leadEvent.groupBy({ by: ["eventType"], where: { listingId: job.listingId, createdAt: { gte: periodStart, lte: periodEnd } }, _count: { eventType: true } }),
        prisma.lead.findMany({ where: { listingId: job.listingId, createdAt: { gte: periodStart, lte: periodEnd } } }),
        prisma.appointment.findMany({ where: { listingId: job.listingId, createdAt: { gte: periodStart, lte: periodEnd } } })
      ]);
      const metrics = Object.fromEntries(events.map((e) => [e.eventType, e._count.eventType]));
      const summary = await generateSellerReportSummary({ listing, metrics, leads, appointments });
      const report = await prisma.sellerReport.create({
        data: {
          listingId: listing.id,
          periodStart,
          periodEnd,
          metricsJson: { ...metrics, leads: leads.length, hotLeads: leads.filter((lead) => lead.leadScore >= 81).length, appointments: appointments.length },
          aiSummary: typeof summary === "object" && summary && "summary" in summary ? String((summary as { summary?: unknown }).summary ?? "") : JSON.stringify(summary),
          sellerEmail: listing.ownerReportEmail ?? listing.sellerEmail,
          shareToken: randomUUID(),
          status: "generated"
        }
      });
      result = { reportId: report.id };
    }

    if (job.type === "daily_manager") {
      const [hotLeads, weakListings, unsentReports] = await Promise.all([
        prisma.lead.findMany({ where: { listing: { agencyId: job.agencyId }, leadScore: { gte: 70 } }, include: { listing: true }, orderBy: { leadScore: "desc" }, take: 8 }),
        prisma.listing.findMany({ where: { agencyId: job.agencyId, aiReadinessScore: { lt: 65 } }, orderBy: { updatedAt: "desc" }, take: 8 }),
        prisma.sellerReport.findMany({ where: { listing: { agencyId: job.agencyId }, sentAt: null }, include: { listing: true }, orderBy: { createdAt: "desc" }, take: 5 })
      ]);
      result = { hotLeads, weakListings, unsentReports };
    }



    if (job.type === "generate_campaign_plan") {
      if (!job.listingId) throw new Error("listingId required");
      const listing = await prisma.listing.findUniqueOrThrow({ where: { id: job.listingId }, include: { media: true, aiOutputs: true } });
      const plan = await generateMarketingCampaign(listing);
      const campaign = await prisma.marketingCampaign.create({
        data: {
          agencyId: listing.agencyId,
          listingId: listing.id,
          name: typeof plan === "object" && plan && "campaign_name" in plan ? String((plan as { campaign_name?: unknown }).campaign_name ?? `${listing.title} kampány`) : `${listing.title} kampány`,
          objective: "lead_generation",
          status: "READY",
          audienceJson: typeof plan === "object" && plan && "audiences" in plan ? ((plan as { audiences?: object }).audiences as object | undefined) : undefined,
          assetsJson: plan as object,
          budgetSuggestionJson: typeof plan === "object" && plan && "budget_suggestion" in plan ? ((plan as { budget_suggestion?: object }).budget_suggestion as object | undefined) : undefined
        }
      });
      await prisma.aiOutput.create({ data: { listingId: listing.id, outputType: "campaign_plan", contentJson: plan as object, modelUsed: "workflow" } });
      result = { campaignId: campaign.id, plan };
    }

    if (job.type === "create_followup_tasks") {
      const leads = await prisma.lead.findMany({
        where: job.listingId ? { listingId: job.listingId } : { listing: { agencyId: job.agencyId } },
        include: { listing: true, events: true }
      });
      let created = 0;
      for (const lead of leads) {
        const tasks = buildFollowUpTasksForLead(lead);
        for (const task of tasks) {
          const exists = await prisma.followUpTask.findFirst({ where: { leadId: lead.id, title: task.title, status: "OPEN" } });
          if (!exists) {
            await prisma.followUpTask.create({ data: { ...task, listingId: lead.listingId, leadId: lead.id, assignedUserId: lead.agentId } });
            created += 1;
          }
        }
      }
      result = { created, checkedLeads: leads.length };
    }

    if (job.type === "rebuild_property_knowledge") {
      if (!job.listingId) throw new Error("listingId required");
      const listing = await prisma.listing.findUniqueOrThrow({ where: { id: job.listingId }, include: { media: true, tours: true, floorplans: true, aiOutputs: true } });
      const knowledge = buildPropertyKnowledgeBase(listing);
      await prisma.aiOutput.create({ data: { listingId: listing.id, outputType: "property_knowledge_base", contentJson: knowledge as object, modelUsed: "rules" } });
      result = knowledge;
    }

    if (job.type === "staging_plan") {
      if (!job.listingId) throw new Error("listingId required");
      const listing = await prisma.listing.findUniqueOrThrow({ where: { id: job.listingId }, include: { media: true } });
      const candidates = listing.media.filter((m) => m.mediaType === "IMAGE" && !m.isStaged).slice(0, 8).map((m) => ({ mediaId: m.id, roomLabel: m.roomLabel, recommendedStyle: "modern, letisztult", disclosure: "AI látványterv - a valós állapot eltérhet" }));
      const output = { candidates, rules: ["eredeti kép megőrzése", "szerkezeti elemek nem módosíthatók", "minden AI stagingelt képen disclosure kötelező"] };
      await prisma.aiOutput.create({ data: { listingId: listing.id, outputType: "staging_plan", contentJson: output, modelUsed: "rules" } });
      result = output;
    }

    return prisma.aiJob.update({ where: { id: job.id }, data: { status: "COMPLETED", result: result as object, finishedAt: new Date(), error: null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown job error";
    const status = job.attempts + 1 >= job.maxAttempts ? "FAILED" as const : "PENDING" as const;
    return prisma.aiJob.update({ where: { id: job.id }, data: { status, error: message, lockedAt: null } });
  }
}

export async function processNextJob(agencyId?: string) {
  const job = await claimNextJob(agencyId);
  if (!job) return null;
  return runJob(job.id);
}
