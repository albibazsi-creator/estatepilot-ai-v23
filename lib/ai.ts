import OpenAI from "openai";
import type { Listing, ListingMedia } from "@prisma/client";
import { mockImageAnalysis, mockListingCopy, mockReelsScript, mockSocialCopy } from "@/lib/mock-ai";
import { generateCampaignPlan as fallbackCampaignPlan } from "@/lib/campaign";
import { env } from "@/lib/env";

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

async function jsonChat<T>(system: string, user: unknown, fallback: T, model = env.OPENAI_MODEL_TEXT): Promise<T> {
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return fallback;
    return JSON.parse(content) as T;
  } catch (error) {
    console.error("AI generation failed, falling back to mock", error);
    return fallback;
  }
}

export async function analyzeListingImages(listing: Listing, media: ListingMedia[]) {
  const fallback = mockImageAnalysis(media);
  return jsonChat(
    [
      "You are an expert real estate photo analyst.",
      "Return only valid JSON with rooms, property_strengths, marketing_angles, warnings.",
      "Never invent hard facts. Do not hide defects. If an image URL is local, analyze only metadata/labels."
    ].join(" "),
    { listing, media: media.map((m) => ({ id: m.id, url: m.url, roomLabel: m.roomLabel, mediaType: m.mediaType, qualityScore: m.qualityScore })) },
    fallback,
    env.OPENAI_MODEL_VISION
  );
}

export async function generateListingDescription(listing: Listing, imageAnalysis?: unknown) {
  const fallback = mockListingCopy(listing);
  return jsonChat(
    [
      "You write Hungarian real estate listing copy.",
      "Return JSON: title, short_hook, long_description, bullet_points, cta, compliance_warnings.",
      "Use only provided facts and clearly avoid fake claims. Mention AI staging disclosure if relevant."
    ].join(" "),
    { listing, imageAnalysis },
    fallback
  );
}

export async function generateSocialContent(listing: Listing, imageAnalysis?: unknown) {
  const fallback = mockSocialCopy(listing);
  return jsonChat(
    "You create platform-specific Hungarian real estate marketing copy. Return JSON keys: facebook, instagram, investor, premium_teaser, headline_variants. Avoid false claims.",
    { listing, imageAnalysis },
    fallback
  );
}

export async function generateReelsScript(listing: Listing) {
  const fallback = mockReelsScript(listing);
  return jsonChat(
    "You create short Hungarian Reels/TikTok real estate scripts. Return JSON keys: hook, script_15s, script_30s, shot_list, voiceover, captions.",
    { listing },
    fallback
  );
}

export async function answerPropertyQuestion(input: { question: string; listing: Listing; mediaCount: number; floorplanCount: number }) {
  const fallback = {
    answer: "Erre nincs pontos adat a hirdetésben, de szívesen továbbítom a kérdést az ingatlanosnak.",
    confidence: "low",
    should_create_lead: true,
    citations: []
  };

  return jsonChat(
    [
      "You are a real estate property chat assistant.",
      "Answer in Hungarian ONLY from the provided listing facts.",
      "If data is missing, say it is not available and offer to forward the question.",
      "Return JSON: answer, confidence, should_create_lead, citations. Never hallucinate."
    ].join(" "),
    input,
    fallback
  );
}

export async function generateSellerReportSummary(input: unknown) {
  const fallback = {
    summary: "A hirdetés az elmúlt időszakban mérhető aktivitást kapott. A következő lépés a forró leadek gyors visszahívása, a borítókép tesztelése és a 3D/360 túra hangsúlyosabb megjelenítése.",
    recommendation: "Maradjon aktív a kampány, a gyengébb képeket érdemes lecserélni, és a meleg leadeket 24 órán belül fel kell hívni.",
    next_week_plan: ["forró leadek hívása", "cover image A/B teszt", "Facebook poszt új címsorral"]
  };

  return jsonChat(
    "You write concise Hungarian seller reports for property owners. Return JSON: summary, recommendation, next_week_plan, owner_friendly_explanation.",
    input,
    fallback
  );
}


export async function generateMarketingCampaign(listing: Listing & { media?: ListingMedia[]; aiOutputs?: any[] }) {
  const fallback = fallbackCampaignPlan(listing);
  return jsonChat(
    [
      "You are a performance marketing strategist for Hungarian real estate agents.",
      "Return JSON with campaign_name, objective, positioning, audiences, assets, budget_suggestion, next_steps.",
      "Do not invent property facts. Mention AI staging disclosures if relevant."
    ].join(" "),
    { listing },
    fallback
  );
}
