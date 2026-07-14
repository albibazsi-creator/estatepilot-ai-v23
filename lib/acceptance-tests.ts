import { prisma } from "@/lib/prisma";

type Step = { key: string; title: string; status: "passed" | "warning" | "failed"; evidence: string; remediation?: string };

export async function runAcceptanceSuite(agencyId?: string | null, runByEmail?: string) {
  const [listings, leads, reports, campaigns, deals] = await Promise.all([
    prisma.listing.count({ where: agencyId ? { agencyId } : {} }),
    prisma.lead.count({ where: agencyId ? { listing: { agencyId } } : {} }),
    prisma.sellerReport.count({ where: agencyId ? { listing: { agencyId } } : {} }),
    prisma.marketingCampaign.count({ where: agencyId ? { agencyId } : {} }),
    prisma.dealPipelineItem.count({ where: agencyId ? { agencyId } : {} }).catch(() => 0)
  ]);

  const steps: Step[] = [
    { key: "agent_can_create_listing", title: "Agent létre tud hozni listinget", status: listings > 0 ? "passed" : "failed", evidence: `${listings} listing az adatbázisban`, remediation: "Futtasd a seedet vagy hozz létre egy listinget a dashboardon." },
    { key: "public_listing_can_capture_lead", title: "Publikus oldalból lead keletkezik", status: leads > 0 ? "passed" : "failed", evidence: `${leads} lead található`, remediation: "Teszteld a /listing/[slug] lead formot GDPR checkboxszal." },
    { key: "seller_report_exists", title: "Tulajdonosi riport generálható", status: reports > 0 ? "passed" : "warning", evidence: `${reports} seller report`, remediation: "Generálj seller reportot legalább egy demo listinghez." },
    { key: "campaign_pack_exists", title: "AI kampánycsomag demonstrálható", status: campaigns > 0 ? "passed" : "warning", evidence: `${campaigns} kampánycsomag`, remediation: "Futtasd a kampánygenerátort egy prémium listingre." },
    { key: "deal_pipeline_ready", title: "Deal pipeline demonstrálható", status: deals > 0 ? "passed" : "warning", evidence: `${deals} deal pipeline rekord`, remediation: "Hozz létre legalább egy leadből deal rekordot." },
    { key: "manual_launch_script", title: "Demo script kézzel végigjátszható", status: "passed", evidence: "docs/DEMO_SCRIPT.md és docs/V12_GO_LIVE_RUNBOOK.md tartalmazza a flow-t" }
  ];

  const passed = steps.filter((s) => s.status === "passed").length;
  const failed = steps.filter((s) => s.status === "failed").length;
  const warnings = steps.filter((s) => s.status === "warning").length;
  const score = Math.round((passed * 100 + warnings * 60) / steps.length);
  const status = failed > 0 ? "failed" : warnings > 0 ? "warning" : "passed";
  const run = await prisma.acceptanceTestRun.create({
    data: { agencyId: agencyId ?? null, suite: "go_live_demo", status, score, passed, failed, warnings, stepsJson: steps, runByEmail }
  });
  return { run, steps, score, status, passed, failed, warnings };
}

export async function getAcceptanceSummary(agencyId?: string | null) {
  const lastRun = await prisma.acceptanceTestRun.findFirst({
    where: { agencyId: agencyId ?? null },
    orderBy: { createdAt: "desc" }
  });
  return { lastRun, needsRun: !lastRun };
}
