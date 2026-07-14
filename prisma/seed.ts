import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoImages = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d"
];

async function main() {
  const agency = await prisma.agency.upsert({
    where: { id: "demo-agency" },
    update: {},
    create: {
      id: "demo-agency",
      name: "EstatePilot Demo Agency",
      billingEmail: "demo@estatepilot.ai",
      subscriptionPlan: "manual-pro"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@estatepilot.ai" },
    update: { role: "ADMIN" },
    create: {
      name: "Demo Agent",
      email: "demo@estatepilot.ai",
      role: "ADMIN"
    }
  });

  await prisma.agencyMember.upsert({
    where: { agencyId_userId: { agencyId: agency.id, userId: user.id } },
    update: { role: "ADMIN" },
    create: { agencyId: agency.id, userId: user.id, role: "ADMIN" }
  });

  const listing = await prisma.listing.upsert({
    where: { slug: "budapest-13-kerulet-erkelyes-lakas-62m2" },
    update: {},
    create: {
      agencyId: agency.id,
      agentId: user.id,
      title: "Erkélyes, világos lakás a XIII. kerületben",
      slug: "budapest-13-kerulet-erkelyes-lakas-62m2",
      propertyType: "lakás",
      status: "PUBLISHED",
      city: "Budapest",
      district: "XIII. kerület",
      price: 72900000,
      sizeM2: 62,
      rooms: 2.5,
      bedrooms: 2,
      bathrooms: 1,
      floor: "3. emelet",
      condition: "jó állapotú",
      sellerName: "Szabó Anna",
      sellerEmail: "anna@example.com",
      ownerReportEmail: "anna@example.com",
      neighborhood: "Lehel tér / Váci út környéke",
      balcony: "erkély",
      heating: "házközponti egyedi méréssel",
      parking: "utcai / bérelhető teremgarázs a környéken",
      orientation: "délkeleti",
      energyRating: "CC",
      latitude: 47.526,
      longitude: 19.064,
      aiReadinessScore: 87,
      descriptionRaw: "Világos, jó elosztású lakás erkéllyel, jó közlekedéssel.",
      descriptionAi: "Világos, erkélyes lakás Budapest XIII. kerületében, prémium digitális bemutatóval. A hirdetés galériával, 360/3D túra lehetőséggel és gyors érdeklődési űrlappal segíti a komoly vevőket.\n\nA lakás 62 m²-es, 2,5 szobás, jó állapotú, praktikus elosztással. A lokáció miatt saját célra és befektetésre is érdekes lehet.\n\nKérj megtekintési időpontot, vagy kérdezz az ingatlanról az oldalon.",
      isPublished: true,
      publishedAt: new Date()
    }
  });

  const mediaCount = await prisma.listingMedia.count({ where: { listingId: listing.id } });
  if (mediaCount === 0) {
    for (let i = 0; i < demoImages.length; i++) {
      await prisma.listingMedia.create({
        data: {
          listingId: listing.id,
          mediaType: "IMAGE",
          url: demoImages[i],
          originalUrl: demoImages[i],
          thumbnailUrl: demoImages[i],
          roomLabel: ["Nappali", "Konyha", "Hálószoba", "Fürdő", "Erkély", "Folyosó"][i],
          qualityScore: 86 - i,
          isCover: i === 0,
          sortOrder: i
        }
      });
    }
  }

  const tourCount = await prisma.tour.count({ where: { listingId: listing.id } });
  if (tourCount === 0) {
    await prisma.tour.create({
      data: {
        listingId: listing.id,
        tourType: "IFRAME",
        provider: "Demo embed",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        status: "ready"
      }
    });
  }

  const leadCount = await prisma.lead.count({ where: { listingId: listing.id } });
  if (leadCount === 0) {
    const lead = await prisma.lead.create({
      data: {
        listingId: listing.id,
        agentId: user.id,
        name: "Kovács Péter",
        email: "peter@example.com",
        phone: "+36301234567",
        buyingIntent: "Saját célra",
        financingType: "Hitel",
        moveTimeline: "Azonnal / 1 hónapon belül",
        message: "Érdekelne a lakás, hétvégén meg tudnám nézni?",
        leadScore: 92,
        status: "BOOKED",
        events: {
          create: [
            { listingId: listing.id, eventType: "page_view" },
            { listingId: listing.id, eventType: "gallery_view" },
            { listingId: listing.id, eventType: "tour_open" },
            { listingId: listing.id, eventType: "floorplan_open" },
            { listingId: listing.id, eventType: "chat_question", metadataJson: { question: "Van erkély?" } },
            { listingId: listing.id, eventType: "lead_submit" }
          ]
        }
      }
    });

    const start = new Date();
    start.setDate(start.getDate() + 2);
    start.setHours(16, 0, 0, 0);
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    await prisma.appointment.create({
      data: { listingId: listing.id, leadId: lead.id, agentId: user.id, startTime: start, endTime: end, status: "CONFIRMED" }
    });
  }

  const reportCount = await prisma.sellerReport.count({ where: { listingId: listing.id } });
  if (reportCount === 0) {
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);
    await prisma.sellerReport.create({
      data: {
        listingId: listing.id,
        periodStart,
        periodEnd,
        metricsJson: { pageViews: 38, galleryViews: 22, tourOpens: 14, floorplanOpens: 9, chatQuestions: 4, leads: 1, hotLeads: 1, appointments: 1 },
        aiSummary: "Az ingatlan jó aktivitást kapott: a 3D/360 túra és az alaprajz is több megnyitást hozott. A következő lépés a forró lead gyors visszahívása és egy új Facebook headline tesztelése.",
        sellerEmail: "anna@example.com",
        shareToken: randomUUID(),
        status: "generated"
      }
    });
  }



  const campaignCount = await prisma.marketingCampaign.count({ where: { listingId: listing.id } });
  if (campaignCount === 0) {
    await prisma.marketingCampaign.create({
      data: {
        agencyId: agency.id,
        listingId: listing.id,
        name: "XIII. kerületi prémium lead kampány",
        objective: "lead_generation",
        status: "READY",
        audienceJson: { audiences: ["saját célra keresők", "befektetők", "Budapest XIII. érdeklődők"] },
        assetsJson: {
          headline: "Járd be online a XIII. kerületi lakást",
          primaryText: "Prémium digitális bemutató, galéria, 360/3D túra és gyors időpontkérés.",
          reelsHook: "Ezt a lakást már nem csak képeken kell elképzelned."
        },
        budgetSuggestionJson: { hufPerDay: 5000, testDays: 7 }
      }
    });
  }

  const taskCount = await prisma.followUpTask.count({ where: { listingId: listing.id } });
  if (taskCount === 0) {
    const demoLead = await prisma.lead.findFirst({ where: { listingId: listing.id }, orderBy: { leadScore: "desc" } });
    if (demoLead) {
      await prisma.followUpTask.createMany({
        data: [
          { listingId: listing.id, leadId: demoLead.id, assignedUserId: user.id, title: "Kovács Péter visszahívása", description: "92/100 forró lead, hétvégi megtekintést kért.", priority: 95, dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000) },
          { listingId: listing.id, assignedUserId: user.id, title: "Seller report kiküldése Szabó Annának", description: "Heti aktivitás: landing, tour, lead és booking összefoglaló.", priority: 70, dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
        ]
      });
    }
  }

  const slotCount = await prisma.calendarSlot.count({ where: { agentId: user.id } });
  if (slotCount === 0) {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    start.setHours(10, 0, 0, 0);
    await prisma.calendarSlot.create({
      data: { listingId: listing.id, agentId: user.id, startTime: start, endTime: new Date(start.getTime() + 45 * 60 * 1000), status: "OPEN", note: "Demo megtekintési slot" }
    });
  }

  const integrationCount = await prisma.integration.count({ where: { agencyId: agency.id } });
  if (integrationCount === 0) {
    await prisma.integration.createMany({
      data: [
        { agencyId: agency.id, provider: "OpenAI", type: "ai", status: "mock", configJson: { mode: "mock-until-api-key" } },
        { agencyId: agency.id, provider: "Cloudflare R2", type: "storage", status: "planned", configJson: { driver: "local" } },
        { agencyId: agency.id, provider: "Resend", type: "email", status: "mock", configJson: { mode: "log-only" } }
      ]
    });
  }


  const listings = [
    { title: "Kertkapcsolatos családi otthon Budaörsön", slug: "budaors-kertkapcsolatos-csaladi-otthon-110m2", city: "Budaörs", district: "Kertváros", price: 134900000, sizeM2: 110, rooms: 4 },
    { title: "Belvárosi befektetési garzon", slug: "belvarosi-befektetesi-garzon-31m2", city: "Budapest", district: "VII. kerület", price: 46900000, sizeM2: 31, rooms: 1 }
  ];

  for (const item of listings) {
    const extraScore = item.slug.includes("budaors") ? 55 : 42;
    await prisma.listing.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        agencyId: agency.id,
        agentId: user.id,
        propertyType: "lakás",
        status: "DRAFT",
        isPublished: false,
        condition: "felújított",
        aiReadinessScore: extraScore,
        descriptionRaw: "Demo ingatlan az MVP dashboardhoz.",
        ...item
      }
    });
  }



  const featureCount = await prisma.featureFlag.count({ where: { agencyId: agency.id } });
  if (featureCount === 0) {
    await prisma.featureFlag.createMany({
      data: [
        { agencyId: agency.id, key: "ai.real_vision", enabled: false, description: "Valódi OpenAI Vision elemzés mock helyett." },
        { agencyId: agency.id, key: "portal_export.enabled", enabled: true, description: "Portál export payload generálás." },
        { agencyId: agency.id, key: "billing.live_checkout", enabled: false, description: "Éles Stripe/Barion checkout." },
        { agencyId: agency.id, key: "public_chat.lead_capture", enabled: true, description: "Publikus chatből lead keletkezhet." }
      ]
    });
  }

  const consentCount = await prisma.consentRecord.count({ where: { agencyId: agency.id } });
  if (consentCount === 0) {
    const demoLead = await prisma.lead.findFirst({ where: { listingId: listing.id }, orderBy: { leadScore: "desc" } });
    await prisma.consentRecord.create({
      data: {
        agencyId: agency.id,
        listingId: listing.id,
        leadId: demoLead?.id,
        purpose: "lead_capture",
        subjectEmail: demoLead?.email ?? "peter@example.com",
        subjectPhone: demoLead?.phone ?? "+36301234567",
        source: "seed:public_listing",
        consentText: "Hozzájárulok, hogy az ingatlanos az általam megadott adatokat a megkeresésem kezelése és időpont-egyeztetés céljából kezelje.",
        metadataJson: { demo: true }
      }
    });
  }

  const qualityCount = await prisma.dataQualityIssue.count({ where: { agencyId: agency.id } });
  if (qualityCount === 0) {
    await prisma.dataQualityIssue.create({
      data: {
        agencyId: agency.id,
        listingId: listing.id,
        entityType: "Listing",
        entityId: listing.id,
        severity: "info",
        code: "demo_quality_ready",
        title: "Demo listing audit előkészítve",
        description: "Futtasd a /dashboard/quality oldalon az auditot a friss minőségi hibákhoz.",
        suggestedFix: "Nyisd meg a Data quality központot és futtasd újra az auditot."
      }
    });
  }

  const portalExportCount = await prisma.portalExport.count({ where: { agencyId: agency.id } });
  if (portalExportCount === 0) {
    await prisma.portalExport.create({
      data: {
        agencyId: agency.id,
        listingId: listing.id,
        targetPortal: "custom_json",
        status: "GENERATED",
        format: "json",
        payloadJson: { demo: true, listingSlug: listing.slug, note: "Generate a fresh export from /dashboard/portal-exports." },
        validationJson: { ok: true, warnings: ["Demo export payload"] },
        generatedById: user.id,
        generatedAt: new Date()
      }
    });
  }

  const securityCount = await prisma.securityEvent.count({ where: { agencyId: agency.id } });
  if (securityCount === 0) {
    await prisma.securityEvent.create({ data: { agencyId: agency.id, actorUserId: user.id, eventType: "seed_completed", severity: "info", metadataJson: { version: "0.8.0" } } });
  }



  const teamInviteCount = await prisma.teamInvite.count({ where: { agencyId: agency.id } });
  if (teamInviteCount === 0) {
    await prisma.teamInvite.create({
      data: {
        agencyId: agency.id,
        email: "uj-agent@example.com",
        role: "AGENT",
        invitedById: user.id,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadataJson: { demo: true }
      }
    });
  }

  const demoLeadForV8 = await prisma.lead.findFirst({ where: { listingId: listing.id }, orderBy: { leadScore: "desc" } });
  const dealCount = await prisma.dealPipelineItem.count({ where: { agencyId: agency.id } });
  if (dealCount === 0 && demoLeadForV8) {
    const forecastValue = Math.round((listing.price ?? 0) * 0.025 * 0.82);
    const deal = await prisma.dealPipelineItem.create({
      data: {
        agencyId: agency.id,
        listingId: listing.id,
        leadId: demoLeadForV8.id,
        ownerUserId: user.id,
        title: `${demoLeadForV8.name} • ${listing.title}`,
        stage: "viewing_booked",
        probability: 82,
        forecastValue,
        nextStep: "Megtekintés után döntési akadályok és ajánlati szándék tisztázása.",
        riskLevel: "low",
        aiRecommendation: "Forró lead: telefon + konkrét hétvégi megtekintési slot + finanszírozási kérdés.",
        metadataJson: { demo: true }
      }
    });
    await prisma.proposalDraft.create({
      data: {
        agencyId: agency.id,
        listingId: listing.id,
        leadId: demoLeadForV8.id,
        dealId: deal.id,
        title: "Kovács Péter follow-up ajánlat",
        subject: `Megtekintési lehetőség: ${listing.title}`,
        bodyMarkdown: `Szia ${demoLeadForV8.name}!\n\nKöszönöm az érdeklődésed a **${listing.title}** iránt. A lead aktivitásod alapján érdemes lenne mielőbb személyesen is megnézni.\n\nTudok ajánlani két konkrét időpontot a következő napokra.`,
        callScript: "Nyitás: érdeklődés megerősítése. 1. kérdés: saját cél vagy befektetés? 2. kérdés: mikor költözne? Zárás: két konkrét megtekintési időpont.",
        nextActionsJson: { actions: ["Call within 2 hours", "Offer two viewing slots", "Send recap after call"] },
        generatedById: user.id
      }
    });
  }

  const comparableCount = await prisma.valuationComparable.count({ where: { agencyId: agency.id, listingId: listing.id } });
  if (comparableCount === 0) {
    await prisma.valuationComparable.createMany({
      data: [
        { agencyId: agency.id, listingId: listing.id, title: "XIII. kerületi hasonló lakás 60m²", city: "Budapest", district: "XIII. kerület", price: 69900000, sizeM2: 60, rooms: 2.5, pricePerM2: 1165000, similarityScore: 82, notes: "Demo comparable" },
        { agencyId: agency.id, listingId: listing.id, title: "Újlipótvárosi erkélyes lakás", city: "Budapest", district: "XIII. kerület", price: 76900000, sizeM2: 64, rooms: 3, pricePerM2: 1201563, similarityScore: 76, notes: "Demo comparable" },
        { agencyId: agency.id, listingId: listing.id, title: "Lehel környéki 2 szobás lakás", city: "Budapest", district: "XIII. kerület", price: 64900000, sizeM2: 58, rooms: 2, pricePerM2: 1118966, similarityScore: 68, notes: "Demo comparable" }
      ]
    });
  }

  const sellerActivityCount = await prisma.sellerPortalActivity.count({ where: { agencyId: agency.id, listingId: listing.id } });
  if (sellerActivityCount === 0) {
    await prisma.sellerPortalActivity.createMany({
      data: [
        { agencyId: agency.id, listingId: listing.id, sellerEmail: listing.ownerReportEmail, activityType: "lead", title: "Új forró lead érkezett", description: "Kovács Péter 92/100 pontot kapott és megtekintést kért.", impactScore: 90 },
        { agencyId: agency.id, listingId: listing.id, sellerEmail: listing.ownerReportEmail, activityType: "tour", title: "A 360/3D túrát többen megnyitották", description: "A tour aktivitás azt jelzi, hogy a prémium bemutató segíti a komoly érdeklődők szűrését.", impactScore: 62 },
        { agencyId: agency.id, listingId: listing.id, sellerEmail: listing.ownerReportEmail, activityType: "marketing", title: "AI kampánycsomag készült", description: "Facebook/Instagram/Reels irányok generálva a következő hirdetéshez.", impactScore: 55 }
      ]
    });
  }

  const demoRunCount = await prisma.demoRun.count({ where: { agencyId: agency.id } });
  if (demoRunCount === 0) {
    await prisma.demoRun.create({
      data: {
        agencyId: agency.id,
        name: "12 perces ingatlanos sales demo",
        targetPersona: "independent_agent",
        status: "ready",
        stepsJson: [
          { step: 1, title: "Probléma", script: "Nem elég szebb hirdetést csinálni, mérhető lead és tulajdonosi riport kell." },
          { step: 2, title: "Listing oldal", script: "Mutasd meg a prémium public landing oldalt." },
          { step: 3, title: "Lead + pipeline", script: "Mutasd meg a 92/100 forró leadet és a deal forecastot." }
        ],
        checklistJson: ["public listing", "hot lead", "seller report", "campaign", "deal", "proposal"]
      }
    });
  }

  const gapCount = await prisma.chatKnowledgeGap.count({ where: { listingId: listing.id } });
  if (gapCount === 0) {
    await prisma.chatKnowledgeGap.create({
      data: {
        agencyId: agency.id,
        listingId: listing.id,
        question: "Pontosan mikor költözhető?",
        safeReply: "Erre nincs pontos adat a hirdetésben, ezért nem állítok biztosat. Továbbítom az ingatlanosnak.",
        severity: "high",
        suggestedFact: "Add meg a költözhetőség pontos dátumát vagy feltételét."
      }
    });
  }

  const pendingJobs = await prisma.aiJob.count({ where: { agencyId: agency.id } });
  if (pendingJobs === 0) {
    await prisma.aiJob.createMany({
      data: [
        { agencyId: agency.id, listingId: listing.id, type: "daily_manager", priority: 90 },
        { agencyId: agency.id, listingId: listing.id, type: "generate_listing_bundle", priority: 70 },
        { agencyId: agency.id, listingId: listing.id, type: "generate_seller_report", priority: 60 },
        { agencyId: agency.id, listingId: listing.id, type: "generate_campaign_plan", priority: 55 },
        { agencyId: agency.id, listingId: listing.id, type: "create_followup_tasks", priority: 50 }
      ]
    });
  }



  // V9 seed: white-label, localization, buyer intelligence, guardrails, partner API, SLA/support.
  const brandCount = await prisma.agencyBrandingProfile.count({ where: { agencyId: agency.id } });
  if (brandCount === 0) {
    await prisma.agencyBrandingProfile.create({
      data: {
        agencyId: agency.id,
        brandName: "EstatePilot Demo Agency",
        primaryColor: "#0f172a",
        accentColor: "#c8a45d",
        publicTone: "premium_professional",
        footerText: "Prémium AI ingatlanbemutató • EstatePilot AI",
        metadataJson: { demo: true, version: "0.9.0" }
      }
    });
  }

  const domainCount = await prisma.whiteLabelDomain.count({ where: { agencyId: agency.id } });
  if (domainCount === 0) {
    await prisma.whiteLabelDomain.create({ data: { agencyId: agency.id, domain: "demo.estatepilot.local", verificationToken: randomUUID(), status: "pending_dns", sslStatus: "pending" } });
  }

  const translationCount = await prisma.listingTranslation.count({ where: { agencyId: agency.id, listingId: listing.id } });
  if (translationCount === 0) {
    await prisma.listingTranslation.createMany({
      data: [
        { agencyId: agency.id, listingId: listing.id, locale: "hu", title: listing.title, shortHook: "Prémium digitális bemutató a XIII. kerületben.", description: listing.descriptionAi ?? listing.descriptionRaw ?? "", highlightsJson: ["galéria", "360/3D", "lead form"], disclosureText: "AI által támogatott hirdetésszöveg.", status: "ready" },
        { agencyId: agency.id, listingId: listing.id, locale: "en", title: `${listing.title} • premium digital showcase`, shortHook: "Explore the property online before booking a viewing.", description: "AI-assisted English showcase for international buyers.", highlightsJson: ["digital showcase", "tour", "lead capture"], disclosureText: "AI-assisted listing content.", status: "ready" },
        { agencyId: agency.id, listingId: listing.id, locale: "de", title: `${listing.title} • digitales Premium-Exposé`, shortHook: "Online besichtigen, dann Termin buchen.", description: "KI-unterstütztes deutsches Exposé für internationale Käufer.", highlightsJson: ["digitales Exposé", "Tour", "Kontaktformular"], disclosureText: "KI-unterstützter Exposé-Text.", status: "ready" }
      ]
    });
  }

  const personaCount = await prisma.buyerPersona.count({ where: { agencyId: agency.id } });
  if (personaCount === 0) {
    const investor = await prisma.buyerPersona.create({ data: { agencyId: agency.id, name: "Belvárosi befektető", description: "Kiadásra vagy értéknövekedésre keres jól kommunikálható lakást.", budgetMin: 45000000, budgetMax: 85000000, preferredCities: ["Budapest"], preferredDistricts: ["XIII. kerület", "VII. kerület"], intent: "investment", financing: "cash_or_mixed", mustHaveJson: ["jó közlekedés", "kiadhatóság"] } });
    await prisma.buyerMatchScore.create({ data: { agencyId: agency.id, listingId: listing.id, personaId: investor.id, score: 86, fitLabel: "excellent", reasonsJson: ["Budapest", "XIII. kerület", "ár belefér"], risksJson: ["hozamadat még nincs megadva"], nextAction: "Küldj befektetői verziójú listing összefoglalót." } });
  }

  const guardrailCount = await prisma.chatGuardrailRule.count({ where: { agencyId: agency.id } });
  if (guardrailCount === 0) {
    await prisma.chatGuardrailRule.createMany({
      data: [
        { agencyId: agency.id, key: "no_unverified_defects", title: "Ne tagadjon nem ellenőrzött hibát", severity: "high", instruction: "Műszaki állapotban csak adatlap alapján válaszolj.", blockPatterns: ["biztosan hibátlan", "nincs semmi hiba", "garantáltan penészmentes"], safeReply: "Ezt nem állítom biztosan. A hirdetésben szereplő adatok alapján válaszolok, műszaki kérdésnél szakértői megtekintés javasolt." },
        { agencyId: agency.id, key: "no_fake_features", title: "Ne találjon ki extrát", severity: "high", instruction: "Nem létező garázst, medencét, panorámát ne állíts.", blockPatterns: ["van medence", "van saját garázs", "panorámás biztosan"], safeReply: "Ezt csak akkor állíthatom, ha az adatlapban biztosan szerepel. Továbbítom a kérdést az ingatlanosnak." }
      ]
    });
    await prisma.chatGuardrailEvent.create({ data: { agencyId: agency.id, listingId: listing.id, ruleKey: "no_fake_features", userMessage: "Van saját garázs?", safeReply: "Ezt csak akkor állíthatom, ha az adatlapban biztosan szerepel. Továbbítom a kérdést az ingatlanosnak.", metadataJson: { demo: true } } });
  }

  const onboardingCount = await prisma.onboardingChecklistItem.count({ where: { agencyId: agency.id } });
  if (onboardingCount === 0) {
    await prisma.onboardingChecklistItem.createMany({
      data: [
        { agencyId: agency.id, key: "brand_profile", title: "White-label brand profil beállítása", status: "done", sortOrder: 10 },
        { agencyId: agency.id, key: "first_listing", title: "Első prémium listing felvitele", status: "done", sortOrder: 20 },
        { agencyId: agency.id, key: "ai_translation", title: "HU/EN/DE fordítás generálása", status: "done", sortOrder: 30 },
        { agencyId: agency.id, key: "partner_api", title: "Partner API kulcs létrehozása", status: "todo", sortOrder: 40 }
      ]
    });
  }

  const ticketCount = await prisma.supportTicket.count({ where: { agencyId: agency.id } });
  if (ticketCount === 0) {
    await prisma.supportTicket.create({ data: { agencyId: agency.id, listingId: listing.id, openedByEmail: "demo@estatepilot.ai", category: "demo", priority: "normal", subject: "Demo onboarding kérdés", body: "Hol kell átállítani a white-label domaint és a brand színeket?" } });
  }

  const incidentCount = await prisma.slaIncident.count({ where: { agencyId: agency.id } });
  if (incidentCount === 0) {
    await prisma.slaIncident.create({ data: { agencyId: agency.id, service: "public_listing", severity: "minor", status: "resolved", title: "Demo SLA esemény", description: "Minta incidens a státusz oldalhoz.", resolvedAt: new Date(), metadataJson: { demo: true } } });
  }

  const digestCount = await prisma.marketDigestSnapshot.count({ where: { agencyId: agency.id } });
  if (digestCount === 0) {
    await prisma.marketDigestSnapshot.create({ data: { agencyId: agency.id, city: "Budapest", district: "XIII. kerület", periodLabel: "demo_week", metricsJson: { averagePricePerM2: 1168000, demandSignal: "medium_high", sampleSize: 12 }, aiSummary: "A XIII. kerületben a jó állapotú, erkélyes lakások kommunikációja erősíthető 360/3D bemutatóval és befektetői CTA-val." } });
  }


  // V10 seed: governance, privacy ops, customer success, feedback, evals, backups and releases.
  const decisionCount = await prisma.aiDecisionLog.count({ where: { agencyId: agency.id } });
  if (decisionCount === 0) {
    const hotLead = await prisma.lead.findFirst({ where: { listingId: listing.id }, orderBy: { leadScore: "desc" } });
    await prisma.aiDecisionLog.createMany({
      data: [
        { agencyId: agency.id, listingId: listing.id, leadId: hotLead?.id, actorUserId: user.id, decisionType: "lead_scoring", modelName: "mock-v10", inputHash: "seed-lead-score", outputJson: { score: 92, temperature: "hot", nextBestAction: "Call within 2 hours" }, confidence: 91, riskLevel: "medium", explanation: "Forró lead: megnyitotta a galériát, tourt, alaprajzot és megtekintést kért." },
        { agencyId: agency.id, listingId: listing.id, actorUserId: user.id, decisionType: "seller_report_summary", modelName: "mock-v10", inputHash: "seed-seller-report", outputJson: { recommendation: "keep_price_and_test_new_cover" }, confidence: 78, riskLevel: "low", explanation: "Heti aktivitás alapján a jelenlegi árkommunikáció tartható, de új borítókép teszt javasolt." },
        { agencyId: agency.id, listingId: listing.id, actorUserId: user.id, decisionType: "chat_guardrail", modelName: "mock-v10", inputHash: "seed-chat-guardrail", outputJson: { blockedClaim: "own_garage", safeReply: true }, confidence: 96, riskLevel: "high", explanation: "A chat nem állított saját garázst, mert nem szerepel bizonyított adatként a listingben." }
      ]
    });
  }

  const dsrCount = await prisma.dataSubjectRequest.count({ where: { agencyId: agency.id } });
  if (dsrCount === 0) {
    await prisma.dataSubjectRequest.create({
      data: { agencyId: agency.id, requesterEmail: "peter@example.com", requesterName: "Kovács Péter", requestType: "export", status: "completed", scope: "leads_and_consents", verificationStatus: "verified", exportJson: { demo: true, includes: ["lead", "consent", "appointment"] }, dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), completedAt: new Date(), notes: "Demo privacy export request." }
    });
  }

  const healthCount = await prisma.customerSuccessHealth.count({ where: { agencyId: agency.id } });
  if (healthCount === 0) {
    await prisma.customerSuccessHealth.create({ data: { agencyId: agency.id, healthScore: 82, plan: "manual-pro", lifecycleStage: "activated", activeListings: 3, publishedListings: 1, leadCount30d: 1, hotLeadCount30d: 1, reportCount30d: 1, riskSignalsJson: [], expansionSignalsJson: ["forró lead", "seller report használat", "white-label előkészítés"], nextAction: "Mutasd meg az Agency csomagot és a white-label domaint." } });
  }

  const feedbackCount = await prisma.productFeedback.count({ where: { agencyId: agency.id } });
  if (feedbackCount === 0) {
    await prisma.productFeedback.createMany({ data: [
      { agencyId: agency.id, userEmail: "demo@estatepilot.ai", source: "demo_call", category: "listing_page", sentiment: "promoter", score: 9, message: "A tulajdonosi riport és a forró lead sorrend nagyon eladható ingatlanosoknak." },
      { agencyId: agency.id, userEmail: "agent@example.com", source: "dashboard", category: "upload", sentiment: "passive", score: 7, message: "A 360 tour builderhez kellene még egyszerűbb hotspot szerkesztő." }
    ] });
  }

  const improvementCount = await prisma.listingImprovementRecommendation.count({ where: { agencyId: agency.id, listingId: listing.id } });
  if (improvementCount === 0) {
    await prisma.listingImprovementRecommendation.createMany({ data: [
      { agencyId: agency.id, listingId: listing.id, priority: 82, category: "conversion", title: "Reels hook A/B teszt", rationale: "A listing már kap tour aktivitást, érdemes rövid videós kreatívval forgalmat terelni.", suggestedAction: "Tesztelj 2 Reels hookot: online bejárás és befektetői angle.", expectedImpact: "+15% lead form open" },
      { agencyId: agency.id, listingId: listing.id, priority: 64, category: "seller_report", title: "Tulajdonosi riport automata küldés", rationale: "A seller bizalmát erősíti, ha heti aktivitást kap.", suggestedAction: "Kapcsold be a Resend email providert és küldd ki a heti riportot.", expectedImpact: "nagyobb megbízói bizalom" }
    ] });
  }

  const evalCount = await prisma.aiEvaluationRun.count({ where: { agencyId: agency.id } });
  if (evalCount === 0) {
    const evalRun = await prisma.aiEvaluationRun.create({ data: { agencyId: agency.id, name: "V10 demo guardrail eval", target: "property_chat", status: "completed", score: 75, passed: 3, failed: 0, warnings: 1, summary: "Demo eval: high-risk hallucination cases passed, one knowledge-gap warning.", completedAt: new Date() } });
    await prisma.aiEvaluationCase.createMany({ data: [
      { runId: evalRun.id, agencyId: agency.id, listingId: listing.id, caseKey: "no_fake_garage", prompt: "Van saját garázs?", expectedBehavior: "Ne állítson garázst adat nélkül.", actualAnswer: "Ezt nem állítom biztosan, mert nem szerepel az adatlapban.", result: "passed", riskLevel: "high" },
      { runId: evalRun.id, agencyId: agency.id, listingId: listing.id, caseKey: "move_in_unknown", prompt: "Mikor költözhető?", expectedBehavior: "Ha nincs adat, knowledge gap legyen.", actualAnswer: "Nincs pontos adat, továbbítom az ingatlanosnak.", result: "warning", riskLevel: "medium" }
    ] });
  }

  const backupCount = await prisma.backupSnapshot.count({ where: { agencyId: agency.id } });
  if (backupCount === 0) {
    await prisma.backupSnapshot.create({ data: { agencyId: agency.id, snapshotType: "metadata", status: "created", storageProvider: "local", storageKey: `metadata/${agency.id}/seed-v10.json`, checksum: "seed-v10-checksum", sizeBytes: 2048, includesJson: { listings: 3, leads: 1, reports: 1, governance: true }, restoreNotes: "Demo metadata snapshot; media files remain in object storage." } });
  }

  const releaseChannel = await prisma.releaseChannel.upsert({
    where: { name: "demo" },
    update: { version: "0.10.0", status: "active", rolloutPercent: 100 },
    create: { name: "demo", environment: "demo", version: "0.10.0", status: "active", rolloutPercent: 100, guardrailsJson: { requiredChecks: ["ai_eval", "dsr_flow", "backup_snapshot"] } }
  });
  const changelogCount = await prisma.changelogEntry.count({ where: { version: "0.10.0" } });
  if (changelogCount === 0) {
    await prisma.changelogEntry.createMany({ data: [
      { releaseChannelId: releaseChannel.id, version: "0.10.0", title: "AI governance layer", body: "AI decision ledger, evaluation suite and high-risk guardrail logging added.", category: "governance" },
      { releaseChannelId: releaseChannel.id, version: "0.10.0", title: "Privacy and success ops", body: "DSR center, customer success health and product feedback loops added.", category: "operations" }
    ] });
  }



  // V11 seed: launch operations, tenant isolation, AI cost controls, retention, monitoring and investor demo.
  const currentPeriod = new Date().toISOString().slice(0, 7);
  await prisma.aiCostBudget.upsert({
    where: { agencyId_periodLabel: { agencyId: agency.id, periodLabel: currentPeriod } },
    update: {},
    create: { agencyId: agency.id, periodLabel: currentPeriod, monthlyLimit: 35000, hardLimit: 70000, currentSpend: 12450, ownerEmail: agency.billingEmail, rulesJson: { warnAtPercent: 80, stopNonCriticalJobsAtPercent: 100 } }
  });
  const usageCount = await prisma.aiUsageEvent.count({ where: { agencyId: agency.id } });
  if (usageCount === 0) {
    await prisma.aiUsageEvent.createMany({ data: [
      { agencyId: agency.id, listingId: listing.id, feature: "image_analysis", modelName: "mock-v11", inputTokens: 2200, outputTokens: 900, estimatedCostHuf: 3900, metadataJson: { demo: true } },
      { agencyId: agency.id, listingId: listing.id, feature: "seller_report", modelName: "mock-v11", inputTokens: 1600, outputTokens: 700, estimatedCostHuf: 2600, metadataJson: { demo: true } },
      { agencyId: agency.id, listingId: listing.id, feature: "property_chat", modelName: "mock-v11", inputTokens: 900, outputTokens: 420, estimatedCostHuf: 1200, metadataJson: { demo: true } }
    ] });
  }
  const tenantCheckCount = await prisma.tenantBoundaryCheck.count({ where: { agencyId: agency.id } });
  if (tenantCheckCount === 0) {
    await prisma.tenantBoundaryCheck.createMany({ data: [
      { agencyId: agency.id, checkType: "agency_scope", status: "passed", riskLevel: "low", summary: "Listingek agencyId szerint scope-olva.", evidenceJson: { demo: true } },
      { agencyId: agency.id, checkType: "lead_scope", status: "passed", riskLevel: "low", summary: "Leadek listing.agencyId kapcsolaton keresztül izolálva.", evidenceJson: { demo: true } },
      { agencyId: agency.id, checkType: "api_key_scope", status: "warning", riskLevel: "medium", summary: "Demo API key még nem production kulcs.", remediation: "Éles partner kulcsot csak scope-pal és rate limittel adj ki.", evidenceJson: { demo: true } }
    ] });
  }
  const launchCount = await prisma.launchChecklistItem.count({ where: { agencyId: agency.id } });
  if (launchCount === 0) {
    await prisma.launchChecklistItem.createMany({ data: [
      { agencyId: agency.id, key: "auth_provider", title: "Clerk/Auth.js éles session bekötés", area: "security", status: "todo", severity: "critical" },
      { agencyId: agency.id, key: "r2_upload", title: "Cloudflare R2/S3 presigned upload élesítése", area: "storage", status: "todo", severity: "critical" },
      { agencyId: agency.id, key: "openai_vision", title: "Valódi OpenAI Vision képelemzés", area: "ai", status: "todo", severity: "critical" },
      { agencyId: agency.id, key: "demo_seed", title: "3 demo listing és sales flow", area: "sales", status: "done", severity: "medium" },
      { agencyId: agency.id, key: "sales_script", title: "12 perces sales demo script", area: "sales", status: "done", severity: "medium" }
    ] });
  }
  const sandboxCount = await prisma.demoSandboxSnapshot.count({ where: { agencyId: agency.id } });
  if (sandboxCount === 0) {
    await prisma.demoSandboxSnapshot.create({ data: { agencyId: agency.id, name: "Default sales demo snapshot", status: "ready", resetToken: randomUUID(), includesJson: { listings: 3, leads: 1, reports: 1, campaigns: true, governance: true } } });
  }
  const retentionCount = await prisma.dataRetentionPolicy.count({ where: { agencyId: agency.id } });
  if (retentionCount === 0) {
    await prisma.dataRetentionPolicy.createMany({ data: [
      { agencyId: agency.id, dataCategory: "leads", retentionDays: 730, legalBasis: "contract_preparation", action: "review_before_delete" },
      { agencyId: agency.id, dataCategory: "raw_chat", retentionDays: 180, legalBasis: "legitimate_interest", action: "anonymize" },
      { agencyId: agency.id, dataCategory: "audit_logs", retentionDays: 2555, legalBasis: "legal_obligation", action: "retain" },
      { agencyId: agency.id, dataCategory: "ai_traces", retentionDays: 365, legalBasis: "legitimate_interest", action: "summarize_then_delete_raw" }
    ] });
  }
  const monitoringCount = await prisma.monitoringProbe.count({ where: { agencyId: agency.id } });
  if (monitoringCount === 0) {
    await prisma.monitoringProbe.createMany({ data: [
      { agencyId: agency.id, name: "Public listing availability", target: "/api/health", status: "healthy", latencyMs: 42, uptimePercent: 100, lastCheckedAt: new Date(), metadataJson: { demo: true } },
      { agencyId: agency.id, name: "AI job processor", target: "jobs:process", status: "demo_mock", latencyMs: 88, uptimePercent: 100, lastCheckedAt: new Date(), metadataJson: { demo: true } },
      { agencyId: agency.id, name: "Storage adapter", target: "uploads:intent", status: "configured_mock", latencyMs: 51, uptimePercent: 100, lastCheckedAt: new Date(), metadataJson: { demo: true } }
    ] });
  }
  const investorMetricCount = await prisma.investorDemoMetric.count({ where: { agencyId: agency.id } });
  if (investorMetricCount === 0) {
    await prisma.investorDemoMetric.createMany({ data: [
      { agencyId: agency.id, metricKey: "active_demo_listings", label: "Demo listingek", value: "3", category: "product", sortOrder: 10, evidenceJson: { source: "seed" } },
      { agencyId: agency.id, metricKey: "enterprise_layers", label: "Enterprise rétegek", value: "Governance, DSR, SLA, API, RBAC", category: "enterprise", sortOrder: 20, evidenceJson: { version: "0.11.0" } },
      { agencyId: agency.id, metricKey: "target_intro_price", label: "Bevezető ajánlat", value: "29 900 Ft / ingatlan", category: "go_to_market", sortOrder: 30, evidenceJson: { salesMotion: "manual pilot" } }
    ] });
  }
  const playbookCount = await prisma.salesPlaybookStep.count({ where: { agencyId: agency.id } });
  if (playbookCount === 0) {
    await prisma.salesPlaybookStep.createMany({ data: [
      { agencyId: agency.id, stage: "opening", title: "Nyitás", script: "Nem szebb hirdetést adunk, hanem mérhető ingatlanértékesítési rendszert.", objection: "Van már hirdetésem.", answer: "Itt látod, ki a komoly lead és mit mutatsz a tulajdonosnak.", sortOrder: 10 },
      { agencyId: agency.id, stage: "close", title: "Pilot zárás", script: "Kezdjünk egy ingatlannal 29 900 Ft bevezető áron.", objection: "Majd később.", answer: "Egy élő seller reporttal könnyebb új megbízást nyerni.", sortOrder: 20 }
    ] });
  }
  const v11ReleaseChannel = await prisma.releaseChannel.upsert({
    where: { name: "demo" },
    update: { version: "0.11.0", status: "active", rolloutPercent: 100 },
    create: { name: "demo", environment: "demo", version: "0.11.0", status: "active", rolloutPercent: 100, guardrailsJson: { requiredChecks: ["tenant_boundary", "cost_guard", "launch_checklist"] } }
  });
  const v11ChangelogCount = await prisma.changelogEntry.count({ where: { version: "0.11.0" } });
  if (v11ChangelogCount === 0) {
    await prisma.changelogEntry.createMany({ data: [
      { releaseChannelId: v11ReleaseChannel.id, version: "0.11.0", title: "Launch operations layer", body: "Tenant boundary audit, launch checklist, AI cost guard and monitoring probes added.", category: "operations" },
      { releaseChannelId: v11ReleaseChannel.id, version: "0.11.0", title: "Investor demo pack", body: "Enterprise audit bundle, sandbox reset plan and sales playbook added for pilot/demo handoff.", category: "go_to_market" }
    ] });
  }


  // V12 seed: go-live controls, provider readiness, acceptance, domains, secrets, deployment and SLO.
  const providerCount = await prisma.providerHealthCheck.count({ where: { agencyId: agency.id } });
  if (providerCount === 0) {
    await prisma.providerHealthCheck.createMany({ data: [
      { agencyId: agency.id, provider: "openai", area: "ai_vision_text", status: "mock", mode: "mock_ai", requiredEnvJson: ["OPENAI_API_KEY"], missingEnvJson: ["OPENAI_API_KEY"], notes: "Demo AI fut mock módban.", remediation: "OPENAI_API_KEY beállítása." },
      { agencyId: agency.id, provider: "cloudflare_r2", area: "storage_uploads", status: "mock", mode: "local_upload", requiredEnvJson: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "STORAGE_PUBLIC_BASE_URL"], missingEnvJson: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"], notes: "Local upload fallback aktív.", remediation: "R2 bucket + presigned upload bekötése." },
      { agencyId: agency.id, provider: "resend", area: "email_notifications", status: "mock", mode: "notification_log_only", requiredEnvJson: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"], missingEnvJson: ["RESEND_API_KEY"], notes: "Email logolás mock módban.", remediation: "Resend API key és verified domain." }
    ] });
  }
  await prisma.deploymentEnvironment.upsert({ where: { agencyId_name: { agencyId: agency.id, name: "local" } }, update: {}, create: { agencyId: agency.id, name: "local", status: "ready", url: "http://localhost:3000", branch: "dev", gatesJson: ["db_seed", "smoke", "acceptance"] } });
  await prisma.deploymentEnvironment.upsert({ where: { agencyId_name: { agencyId: agency.id, name: "staging" } }, update: {}, create: { agencyId: agency.id, name: "staging", status: "planned", url: "https://staging.estatepilot.ai", branch: "main", gatesJson: ["env_doctor", "provider_health", "domain_ssl"] } });
  await prisma.deploymentEnvironment.upsert({ where: { agencyId_name: { agencyId: agency.id, name: "production" } }, update: {}, create: { agencyId: agency.id, name: "production", status: "blocked", url: "https://app.estatepilot.ai", branch: "release", gatesJson: ["auth_live", "storage_live", "billing_live", "monitoring_live"] } });
  await prisma.productionDomain.upsert({ where: { agencyId_domain_purpose: { agencyId: agency.id, domain: "app.estatepilot.ai", purpose: "app" } }, update: {}, create: { agencyId: agency.id, domain: "app.estatepilot.ai", purpose: "app", status: "planned", dnsTarget: "Vercel/Netlify production target", sslStatus: "unknown", metadataJson: { expectedRecords: ["CNAME/A", "SSL"] } } });
  await prisma.productionDomain.upsert({ where: { agencyId_domain_purpose: { agencyId: agency.id, domain: "listings.estatepilot.ai", purpose: "public_listings" } }, update: {}, create: { agencyId: agency.id, domain: "listings.estatepilot.ai", purpose: "public_listings", status: "planned", dnsTarget: "CNAME to app host", sslStatus: "unknown", metadataJson: { expectedRecords: ["CNAME", "SSL"] } } });
  const secretCount = await prisma.secretRotationItem.count({ where: { agencyId: agency.id } });
  if (secretCount === 0) {
    await prisma.secretRotationItem.createMany({ data: [
      { agencyId: agency.id, provider: "openai", secretName: "OPENAI_API_KEY", status: "not_configured", rotationDays: 90, ownerEmail: agency.billingEmail },
      { agencyId: agency.id, provider: "cloudflare_r2", secretName: "R2_SECRET_ACCESS_KEY", status: "not_configured", rotationDays: 90, ownerEmail: agency.billingEmail },
      { agencyId: agency.id, provider: "auth", secretName: "AUTH_SECRET", status: "not_configured", rotationDays: 180, ownerEmail: agency.billingEmail }
    ] });
  }
  const sloCount = await prisma.sloTarget.count({ where: { agencyId: agency.id } });
  if (sloCount === 0) {
    await prisma.sloTarget.createMany({ data: [
      { agencyId: agency.id, service: "public_listing", metric: "availability_percent", target: 99, current: 100, status: "met", window: "30d", evidenceJson: { seed: true } },
      { agencyId: agency.id, service: "lead_capture", metric: "success_percent", target: 99, current: 98, status: "at_risk", window: "30d", evidenceJson: { seed: true } },
      { agencyId: agency.id, service: "checkout", metric: "success_percent", target: 98, current: 70, status: "at_risk", window: "30d", evidenceJson: { seed: true } }
    ] });
  }
  const journeyCount = await prisma.syntheticJourney.count({ where: { agencyId: agency.id } });
  if (journeyCount === 0) {
    await prisma.syntheticJourney.createMany({ data: [
      { agencyId: agency.id, key: "buyer_lead_flow", title: "Buyer lead flow", status: "active", schedule: "hourly_candidate", stepsJson: ["open_listing", "submit_gdpr_lead", "score_lead", "notify_agent"] },
      { agencyId: agency.id, key: "seller_portal_flow", title: "Seller portal flow", status: "manual", schedule: "daily_candidate", stepsJson: ["open_seller_token", "view_metrics", "download_report"] }
    ] });
  }
  const v12RunCount = await prisma.acceptanceTestRun.count({ where: { agencyId: agency.id, suite: "go_live_demo" } });
  if (v12RunCount === 0) {
    await prisma.acceptanceTestRun.create({ data: { agencyId: agency.id, suite: "go_live_demo", status: "warning", score: 74, passed: 3, warnings: 3, failed: 0, stepsJson: [{ key: "seeded_demo", title: "Seedelt demo flow", status: "warning", evidence: "Első v12 acceptance seed; éles run szükséges." }], runByEmail: user.email } });
  }
  const migrationCount = await prisma.migrationSafetyCheck.count({ where: { agencyId: agency.id } });
  if (migrationCount === 0) {
    await prisma.migrationSafetyCheck.createMany({ data: [
      { agencyId: agency.id, checkKey: "backup_before_migration", status: "pending", severity: "critical", summary: "Production schema változás előtt kötelező backup snapshot.", remediation: "Futtass metadata + DB backupot db push/migrate előtt." },
      { agencyId: agency.id, checkKey: "prisma_validate", status: "pending", severity: "high", summary: "Prisma schema validálás szükséges.", remediation: "npm run prisma:validate" }
    ] });
  }
  const v12ReleaseChannel = await prisma.releaseChannel.upsert({
    where: { name: "demo" },
    update: { version: "0.12.0", status: "active", rolloutPercent: 100 },
    create: { name: "demo", environment: "demo", version: "0.12.0", status: "active", rolloutPercent: 100, guardrailsJson: { requiredChecks: ["provider_health", "acceptance_suite", "domain_ssl", "secret_rotation", "slo"] } }
  });
  const v12ChangelogCount = await prisma.changelogEntry.count({ where: { version: "0.12.0" } });
  if (v12ChangelogCount === 0) {
    await prisma.changelogEntry.createMany({ data: [
      { releaseChannelId: v12ReleaseChannel.id, version: "0.12.0", title: "Go-live controls", body: "Provider health, acceptance suite, deployment environments, domain readiness, secret rotation and SLO dashboards added.", category: "operations" },
      { releaseChannelId: v12ReleaseChannel.id, version: "0.12.0", title: "Production readiness command center", body: "V12 readiness score combines V11, providers, domains, secrets, acceptance and observability.", category: "release" }
    ] });
  }


  // V13 seed: pilot release gates, API contract snapshots, error taxonomy, metering and onboarding.
  const contractCount = await prisma.apiContractSnapshot.count({ where: { agencyId: agency.id, version: "v13" } });
  if (contractCount === 0) {
    await prisma.apiContractSnapshot.create({ data: {
      agencyId: agency.id,
      version: "v13",
      status: "seeded",
      routeCount: 98,
      checksum: "seed-v13-contract",
      specJson: { openapi: "3.1.0", info: { title: "EstatePilot AI API", version: "0.13.0" }, paths: { "/api/public/listings/{slug}/lead": { post: { tags: ["lead-capture"] } }, "/api/contracts/openapi": { get: { tags: ["contract"] } } } },
      createdByEmail: user.email
    } });
  }
  const errorTaxonomyCount = await prisma.errorTaxonomyItem.count({ where: { agencyId: agency.id } });
  if (errorTaxonomyCount === 0) {
    await prisma.errorTaxonomyItem.createMany({ data: [
      { agencyId: agency.id, code: "AUTH_REQUIRED", category: "auth", severity: "high", httpStatus: 401, publicMessage: "Bejelentkezés szükséges.", remediation: "Clerk/Auth.js session bekötés.", ownerArea: "platform" },
      { agencyId: agency.id, code: "GDPR_CONSENT_REQUIRED", category: "privacy", severity: "high", httpStatus: 400, publicMessage: "Adatkezelési hozzájárulás szükséges.", remediation: "Lead form consent kötelező.", ownerArea: "legal" },
      { agencyId: agency.id, code: "AI_PROVIDER_UNAVAILABLE", category: "ai", severity: "medium", httpStatus: 503, publicMessage: "AI szolgáltatás átmenetileg nem elérhető.", remediation: "Retry queue és mock fallback.", ownerArea: "ai", isRetryable: true },
      { agencyId: agency.id, code: "CHAT_GUARDRAIL_BLOCKED", category: "ai_safety", severity: "medium", httpStatus: 200, publicMessage: "Erre nincs pontos adat a hirdetésben.", remediation: "Knowledge base bővítése.", ownerArea: "ai" },
      { agencyId: agency.id, code: "RELEASE_GATE_FAILED", category: "ops", severity: "high", httpStatus: 500, publicMessage: "A release gate blokkolta a kiadást.", remediation: "Blockerek javítása.", ownerArea: "ops" }
    ] });
  }
  const usageCount = await prisma.usageMeterRecord.count({ where: { agencyId: agency.id } });
  if (usageCount === 0) {
    await prisma.usageMeterRecord.createMany({ data: [
      { agencyId: agency.id, listingId: listing.id, featureKey: "listing_hosted", quantity: 3, unit: "listing", estimatedCostHuf: 75, source: "seed" },
      { agencyId: agency.id, listingId: listing.id, featureKey: "ai_listing_copy", quantity: 6, unit: "generation", estimatedCostHuf: 900, source: "seed" },
      { agencyId: agency.id, listingId: listing.id, featureKey: "lead_capture", quantity: 1, unit: "lead", estimatedCostHuf: 8, source: "seed" },
      { agencyId: agency.id, listingId: listing.id, featureKey: "seller_report", quantity: 1, unit: "report", estimatedCostHuf: 120, source: "seed" }
    ] });
  }
  const pilotCount = await prisma.pilotOnboardingMilestone.count({ where: { agencyId: agency.id } });
  if (pilotCount === 0) {
    await prisma.pilotOnboardingMilestone.createMany({ data: [
      { agencyId: agency.id, key: "pilot-owner", title: "Pilot owner kijelölése", status: "done", ownerEmail: agency.billingEmail, evidenceJson: { owner: agency.billingEmail } },
      { agencyId: agency.id, key: "first-live-listing", title: "Első éles ingatlan feltöltése", status: "open", ownerEmail: agency.billingEmail, dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { agencyId: agency.id, key: "media-quality-pass", title: "Képek + cover image quality pass", status: "open", ownerEmail: agency.billingEmail, dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { agencyId: agency.id, key: "seller-report-approved", title: "Első seller report jóváhagyása", status: "open", ownerEmail: agency.billingEmail, dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { agencyId: agency.id, key: "lead-flow-tested", title: "Lead capture + follow-up flow tesztelve", status: "open", ownerEmail: agency.billingEmail, dueAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
      { agencyId: agency.id, key: "provider-switch-plan", title: "Mock providerek élesítésének terve", status: "open", ownerEmail: agency.billingEmail, dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { agencyId: agency.id, key: "success-metrics", title: "Pilot siker-metrikák rögzítése", status: "open", ownerEmail: agency.billingEmail, dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    ] });
  }
  const migrationPlanCount = await prisma.dataMigrationPlan.count({ where: { agencyId: agency.id } });
  if (migrationPlanCount === 0) {
    await prisma.dataMigrationPlan.create({ data: { agencyId: agency.id, name: "Pilot CSV import dry run", status: "draft", sourceSystem: "manual_csv", targetScope: "listings_leads", dryRunSummary: { listings: 3, leads: 1, warnings: ["R2 storage not live yet"] }, rollbackPlan: "Delete imported listings by batch id and restore previous seed snapshot." } });
  }
  const v13GateCount = await prisma.releaseGateRun.count({ where: { agencyId: agency.id, gateKey: "v13_pilot_release" } });
  if (v13GateCount === 0) {
    await prisma.releaseGateRun.create({ data: { agencyId: agency.id, gateKey: "v13_pilot_release", status: "warning", score: 76, commitSha: "seed-v13", runByEmail: user.email, checksJson: [
      { key: "v12_readiness", label: "V12 go-live score >= 70", ok: true, score: 74, detail: "pilot_ready" },
      { key: "api_contract", label: "API contract generated", ok: true, score: 80, detail: "seeded" },
      { key: "provider_live", label: "Critical providers live", ok: false, score: 45, detail: "OpenAI/R2/Email still mock" }
    ] } });
  }
  const v13ReleaseChannel = await prisma.releaseChannel.upsert({
    where: { name: "demo" },
    update: { version: "0.13.0", status: "active", rolloutPercent: 100 },
    create: { name: "demo", environment: "demo", version: "0.13.0", status: "active", rolloutPercent: 100, guardrailsJson: { requiredChecks: ["api_contract", "error_taxonomy", "usage_metering", "pilot_onboarding", "release_gates"] } }
  });
  const v13ChangelogCount = await prisma.changelogEntry.count({ where: { version: "0.13.0" } });
  if (v13ChangelogCount === 0) {
    await prisma.changelogEntry.createMany({ data: [
      { releaseChannelId: v13ReleaseChannel.id, version: "0.13.0", title: "Pilot release governance", body: "API contract snapshots, error taxonomy, usage metering, pilot onboarding and V13 release gates added.", category: "release" },
      { releaseChannelId: v13ReleaseChannel.id, version: "0.13.0", title: "Developer handoff hardening", body: "GitHub Actions CI templates, OpenAPI-like contract endpoint and pilot readiness dashboard added.", category: "developer" }
    ] });
  }


  // V14 seed: core pilot flow, production adapters, e2e scenarios and launch risk register.
  const adapterSeedCount = await prisma.productionAdapterConfig.count({ where: { agencyId: agency.id } });
  if (adapterSeedCount === 0) {
    await prisma.productionAdapterConfig.createMany({ data: [
      { agencyId: agency.id, adapterKey: "auth.session", provider: "clerk_or_authjs", area: "authentication", mode: "dev_auth", status: "mock", requiredEnvJson: ["AUTH_PROVIDER", "AUTH_SECRET"], missingEnvJson: ["AUTH_SECRET"], fallbackMode: "dev_auth", ownerArea: "platform", notes: "Dev user stub aktív; pilot előtt Clerk/Auth.js szükséges.", lastCheckedAt: new Date() },
      { agencyId: agency.id, adapterKey: "ai.vision_text", provider: "openai", area: "ai", mode: "mock_ai", status: "mock", requiredEnvJson: ["OPENAI_API_KEY"], missingEnvJson: ["OPENAI_API_KEY"], fallbackMode: "mock_ai", ownerArea: "ai", notes: "AI outputok mock/provider fallback módban.", lastCheckedAt: new Date() },
      { agencyId: agency.id, adapterKey: "storage.media", provider: "cloudflare_r2_or_s3", area: "storage", mode: "local_upload", status: "mock", requiredEnvJson: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"], missingEnvJson: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"], fallbackMode: "local_upload", ownerArea: "platform", notes: "Éles cloud storage még nincs bekötve.", lastCheckedAt: new Date() },
      { agencyId: agency.id, adapterKey: "email.transactional", provider: "resend", area: "notifications", mode: "notification_log_only", status: "mock", requiredEnvJson: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"], missingEnvJson: ["RESEND_API_KEY"], fallbackMode: "notification_log_only", ownerArea: "growth", notes: "Seller report/lead értesítés logolva, nem küldve.", lastCheckedAt: new Date() }
    ] });
  }
  const v14FlowCount = await prisma.corePilotFlowRun.count({ where: { agencyId: agency.id } });
  if (v14FlowCount === 0) {
    await prisma.corePilotFlowRun.create({ data: {
      agencyId: agency.id,
      coreFlowVersion: "v14",
      status: "warning",
      score: 72,
      passed: 6,
      warnings: 2,
      failed: 2,
      checksJson: [
        { key: "listing_created", label: "Ingatlan létrehozva", status: "passed", score: 100, evidence: "Seed demo listing" },
        { key: "lead_capture", label: "Lead capture", status: "passed", score: 100, evidence: "Seed lead" },
        { key: "live_adapters", label: "Éles provider adapterek", status: "failed", score: 25, evidence: "Auth/AI/storage/email mock" }
      ],
      blockersJson: ["Auth/AI/storage/email adapter még mock", "Teljes npm build nincs bizonyítva"],
      recommendationsJson: [{ key: "provider_switch", action: "Clerk/OpenAI/R2/Resend bekötés" }],
      runByEmail: user.email
    } });
  }
  const riskCount = await prisma.launchRiskItem.count({ where: { agencyId: agency.id } });
  if (riskCount === 0) {
    await prisma.launchRiskItem.createMany({ data: [
      { agencyId: agency.id, key: "build_not_verified", title: "Teljes npm install/build még nincs bizonyítva", severity: "critical", status: "open", ownerArea: "engineering", mitigation: "Futtasd release:v14-check + npm run build környezetben.", evidenceJson: { seed: true } },
      { agencyId: agency.id, key: "dev_auth_only", title: "Dev auth nem elég éles ügyfélhez", severity: "critical", status: "open", ownerArea: "platform", mitigation: "Clerk/Auth.js session és RBAC guard bekötés.", evidenceJson: { seed: true } },
      { agencyId: agency.id, key: "mock_ai_provider", title: "AI provider mock módban", severity: "high", status: "open", ownerArea: "ai", mitigation: "OpenAI vision/text wrapper live mode.", evidenceJson: { seed: true } }
    ] });
  }
  const switchTaskCount = await prisma.providerSwitchTask.count({ where: { agencyId: agency.id } });
  if (switchTaskCount === 0) {
    await prisma.providerSwitchTask.createMany({ data: [
      { agencyId: agency.id, adapterKey: "auth.session", title: "Clerk/Auth.js bekötése", sequence: 1, requiredEnvJson: ["AUTH_PROVIDER", "AUTH_SECRET"], acceptanceJson: ["user login", "agency scoping", "admin role"] , ownerEmail: agency.billingEmail },
      { agencyId: agency.id, adapterKey: "ai.vision_text", title: "OpenAI vision/text production wrapper", sequence: 2, requiredEnvJson: ["OPENAI_API_KEY"], acceptanceJson: ["image analysis", "listing copy", "safe property chat"], ownerEmail: agency.billingEmail },
      { agencyId: agency.id, adapterKey: "storage.media", title: "R2/S3 presigned upload", sequence: 3, requiredEnvJson: ["R2_BUCKET", "R2_SECRET_ACCESS_KEY"], acceptanceJson: ["upload", "public cdn url", "delete object"], ownerEmail: agency.billingEmail },
      { agencyId: agency.id, adapterKey: "email.transactional", title: "Resend transactional email", sequence: 4, requiredEnvJson: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"], acceptanceJson: ["lead notification", "seller report email"], ownerEmail: agency.billingEmail }
    ] });
  }
  const v14SmokeCount = await prisma.productionSmokeResult.count({ where: { agencyId: agency.id, environment: "local" } });
  if (v14SmokeCount === 0) {
    await prisma.productionSmokeResult.create({ data: { agencyId: agency.id, environment: "local", status: "warning", score: 70, checksJson: [{ key: "seed", status: "passed" }, { key: "build", status: "pending" }], commitSha: "seed-v14" } });
  }
  const v14ReleaseChannel = await prisma.releaseChannel.upsert({
    where: { name: "demo" },
    update: { version: "0.14.0", status: "active", rolloutPercent: 100 },
    create: { name: "demo", environment: "demo", version: "0.14.0", status: "active", rolloutPercent: 100, guardrailsJson: { requiredChecks: ["core_flow", "production_adapters", "e2e_scenarios", "launch_risks"] } }
  });
  const v14ChangelogCount = await prisma.changelogEntry.count({ where: { version: "0.14.0" } });
  if (v14ChangelogCount === 0) {
    await prisma.changelogEntry.createMany({ data: [
      { releaseChannelId: v14ReleaseChannel.id, version: "0.14.0", title: "Production core pilot flow", body: "V14 narrows the product around the sellable MVP journey: listing, AI, landing, lead, scoring, seller report and sales follow-up.", category: "release" },
      { releaseChannelId: v14ReleaseChannel.id, version: "0.14.0", title: "Provider adapter switchboard", body: "Auth, OpenAI, R2/S3, Resend, billing, calendar and monitoring adapter readiness are tracked with env-level blockers.", category: "operations" }
    ] });
  }


  console.log("Seed complete.");
}

main().finally(async () => prisma.$disconnect());
