import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(3),
  propertyType: z.string().min(2).default("lakás"),
  sellerName: z.string().optional().nullable(),
  sellerEmail: z.string().email().optional().nullable(),
  ownerReportEmail: z.string().email().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  parking: z.string().optional().nullable(),
  balcony: z.string().optional().nullable(),
  heating: z.string().optional().nullable(),
  orientation: z.string().optional().nullable(),
  energyRating: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  currency: z.string().length(3).default("HUF"),
  city: z.string().min(2),
  district: z.string().optional().nullable(),
  addressOptional: z.string().optional().nullable(),
  price: z.coerce.number().int().positive().optional().nullable(),
  sizeM2: z.coerce.number().positive().optional().nullable(),
  rooms: z.coerce.number().positive().optional().nullable(),
  bedrooms: z.coerce.number().int().nonnegative().optional().nullable(),
  bathrooms: z.coerce.number().int().nonnegative().optional().nullable(),
  floor: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  descriptionRaw: z.string().optional().nullable()
});

export const mediaSchema = z.object({
  mediaType: z.enum(["IMAGE", "VIDEO", "PANORAMA_360", "FLOORPLAN"]).default("IMAGE"),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional().nullable(),
  roomLabel: z.string().optional().nullable(),
  isCover: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0)
});

export const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(6).optional().nullable(),
  message: z.string().optional().nullable(),
  buyingIntent: z.string().optional().nullable(),
  financingType: z.string().optional().nullable(),
  moveTimeline: z.string().optional().nullable(),
  gdprConsent: z.literal(true)
});

export const tourSchema = z.object({
  tourType: z.enum(["MATTERPORT", "IFRAME", "PANORAMA_360", "CUSTOM_360", "GAUSSIAN_SPLAT"]),
  provider: z.string().optional().nullable(),
  embedUrl: z.string().url().optional().nullable()
});


export const eventSchema = z.object({
  eventType: z.enum([
    "page_view",
    "gallery_view",
    "tour_open",
    "tour_complete",
    "floorplan_open",
    "lead_submit",
    "booking_created",
    "chat_question",
    "call_clicked",
    "share_clicked"
  ]),
  leadId: z.string().optional().nullable(),
  metadataJson: z.record(z.unknown()).optional().nullable()
});

export const jobSchema = z.object({
  listingId: z.string().optional().nullable(),
  type: z.enum([
    "analyze_images",
    "generate_listing_bundle",
    "generate_seller_report",
    "recalculate_leads",
    "daily_manager",
    "staging_plan",
    "generate_campaign_plan",
    "create_followup_tasks",
    "rebuild_property_knowledge"
  ]),
  priority: z.coerce.number().int().min(0).max(100).default(50),
  payload: z.record(z.unknown()).optional().nullable()
});


export const campaignSchema = z.object({
  listingId: z.string().min(1),
  name: z.string().min(2).optional(),
  objective: z.string().min(2).default("lead_generation")
});

export const followUpTaskSchema = z.object({
  listingId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  priority: z.coerce.number().int().min(0).max(100).default(50),
  dueAt: z.coerce.date().optional().nullable()
});

export const calendarSlotSchema = z.object({
  listingId: z.string().optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  note: z.string().optional().nullable()
}).refine((data) => data.endTime > data.startTime, { message: "endTime must be after startTime" });


export const portalExportSchema = z.object({
  targetPortal: z.enum(["ingatlan_com", "otpotthon", "facebook_marketplace", "custom_json"]).default("custom_json"),
  format: z.enum(["json", "csv"]).default("json")
});

export const consentSchema = z.object({
  listingId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  purpose: z.string().min(2),
  subjectEmail: z.string().email().optional().nullable(),
  subjectPhone: z.string().optional().nullable(),
  source: z.string().min(2),
  consentText: z.string().min(8),
  metadataJson: z.record(z.unknown()).optional().nullable()
});

export const featureFlagSchema = z.object({
  key: z.string().min(2).regex(/^[a-z0-9_.-]+$/),
  enabled: z.boolean().default(false),
  description: z.string().optional().nullable(),
  rolloutJson: z.record(z.unknown()).optional().nullable()
});
