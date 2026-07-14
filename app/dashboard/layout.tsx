export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Bot, Building2, CalendarDays, CheckSquare, FileText, Home, Inbox, KeyRound, Megaphone, Plug, Scale, Settings, Shield, UploadCloud, Workflow, Activity, CreditCard, Database, FileCheck2, Flag, ListChecks, TrendingUp, Users, BriefcaseBusiness, FileSignature, Calculator, Presentation, MessageSquareWarning, Palette, Languages, BrainCircuit, LifeBuoy, Network, Globe2 } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "ĂttekintĂ©s", icon: Home },
  { href: "/dashboard/daily", label: "Napi AI manager", icon: CheckSquare },
  { href: "/dashboard/listings", label: "Ingatlanok", icon: Building2 },
  { href: "/dashboard/leads", label: "Leadek", icon: Inbox },
  { href: "/dashboard/follow-ups", label: "Follow-up", icon: Workflow },
  { href: "/dashboard/campaigns", label: "KampĂˇnyok", icon: Megaphone },
  { href: "/dashboard/deals", label: "Deal pipeline", icon: BriefcaseBusiness },
  { href: "/dashboard/proposals", label: "Proposal draft", icon: FileSignature },
  { href: "/dashboard/sales", label: "Sales cockpit", icon: TrendingUp },
  { href: "/dashboard/appointments", label: "IdĹ‘pontok", icon: CalendarDays },
  { href: "/dashboard/calendar", label: "Slotok", icon: CalendarDays },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/reports", label: "Riportok", icon: FileText },
  { href: "/dashboard/seller-activities", label: "Seller feed", icon: FileText },
  { href: "/dashboard/automation", label: "AI automatizĂˇciĂł", icon: Bot },
  { href: "/dashboard/ai-decisions", label: "AI dĂ¶ntĂ©snaplĂł", icon: Bot },
  { href: "/dashboard/ai-evals", label: "AI evals", icon: BrainCircuit },
  { href: "/dashboard/listing-improvements", label: "JavĂ­tĂˇsi motor", icon: ListChecks },
  { href: "/dashboard/data-privacy", label: "Privacy / DSR", icon: Shield },
  { href: "/dashboard/customer-success", label: "Customer success", icon: TrendingUp },
  { href: "/dashboard/product-feedback", label: "Feedback / NPS", icon: MessageSquareWarning },
  { href: "/dashboard/backups", label: "Backupok", icon: Database },
  { href: "/dashboard/releases", label: "Release notes", icon: Flag },
  { href: "/dashboard/integrations", label: "IntegrĂˇciĂłk", icon: Plug },
  { href: "/dashboard/import-export", label: "Import / Export", icon: UploadCloud },
  { href: "/dashboard/portal-exports", label: "PortĂˇl export", icon: FileCheck2 },
  { href: "/dashboard/valuation", label: "ĂrpozĂ­ciĂł", icon: Calculator },
  { href: "/dashboard/quality", label: "Data quality", icon: ListChecks },
  { href: "/dashboard/compliance", label: "Compliance", icon: Scale },
  { href: "/dashboard/api-keys", label: "API kulcsok", icon: KeyRound },
  { href: "/dashboard/uploads", label: "Upload log", icon: Database },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/ops", label: "Production doctor", icon: Activity },
  { href: "/dashboard/v11-readiness", label: "V11 readiness", icon: Activity },
  { href: "/dashboard/v12-readiness", label: "V12 go-live", icon: Activity },
  { href: "/dashboard/v13-readiness", label: "V13 pilot", icon: Activity },
  { href: "/dashboard/v14-readiness", label: "V14 highest", icon: Activity },
  { href: "/dashboard/v16-readiness", label: "V16 3D readiness", icon: Activity },
  { href: "/dashboard/v17-readiness", label: "V17 3D worker", icon: Activity },
  { href: "/dashboard/v18-readiness", label: "V18 3D highest", icon: Activity },
  { href: "/dashboard/v19-readiness", label: "V19 spatial prod", icon: Activity },
  { href: "/dashboard/v21-start", label: "V21 start gates", icon: Activity },
  { href: "/dashboard/v22-american-grade", label: "V22 American grade", icon: Activity },
  { href: "/dashboard/production-build-gate", label: "Build proof gate", icon: CheckSquare },
  { href: "/dashboard/ai-sla", label: "AI SLA gate", icon: BrainCircuit },
  { href: "/dashboard/spatial-provider-acceptance", label: "3D provider acceptance", icon: Plug },
  { href: "/dashboard/premium-ux-benchmark", label: "Premium UX benchmark", icon: Presentation },
  { href: "/dashboard/crm-automation-qa", label: "CRM automation QA", icon: TrendingUp },
  { href: "/dashboard/provider-certification", label: "Provider certification", icon: FileCheck2 },
  { href: "/dashboard/start-hardening", label: "Start hardening", icon: CheckSquare },
  { href: "/dashboard/live-ai", label: "Live AI wiring", icon: BrainCircuit },
  { href: "/dashboard/live-3d", label: "Live 3D bridge", icon: Plug },
  { href: "/dashboard/premium-demo", label: "Premium demo", icon: Presentation },
  { href: "/dashboard/live-crm", label: "Live CRM", icon: TrendingUp },
  { href: "/dashboard/integration-launch", label: "Integration launch", icon: Plug },
  { href: "/dashboard/3d-orchestrator", label: "3D orchestrator", icon: Workflow },
  { href: "/dashboard/3d-lineage", label: "3D lineage", icon: Database },
  { href: "/dashboard/3d-review", label: "3D review", icon: CheckSquare },
  { href: "/dashboard/3d-viewer-deploy", label: "3D viewer deploy", icon: Plug },
  { href: "/dashboard/3d-sla", label: "3D SLA", icon: Activity },
  { href: "/dashboard/3d-sharing", label: "3D sharing", icon: Globe2 },
  { href: "/dashboard/3d-reconstruction", label: "3D reconstruction", icon: Workflow },
  { href: "/dashboard/3d-manifest-validator", label: "3D manifest gate", icon: FileCheck2 },
  { href: "/dashboard/room-graph", label: "Room graph", icon: Network },
  { href: "/dashboard/3d-acceptance", label: "3D acceptance", icon: CheckSquare },
  { href: "/dashboard/gpu-worker", label: "GPU worker", icon: Database },
  { href: "/dashboard/3d-worker", label: "3D worker", icon: Workflow },
  { href: "/dashboard/3d-scenes", label: "3D scenes", icon: Database },
  { href: "/dashboard/3d-quality", label: "3D quality", icon: CheckSquare },
  { href: "/dashboard/3d-viewer-adapters", label: "3D viewer adapter", icon: Plug },
  { href: "/dashboard/3d-capture", label: "3D capture", icon: Workflow },
  { href: "/dashboard/3d-pipeline", label: "3D pipeline", icon: Activity },
  { href: "/dashboard/digital-twins", label: "Digital twins", icon: Building2 },
  { href: "/dashboard/spatial-assets", label: "Spatial assets", icon: Database },
  { href: "/dashboard/core-flow", label: "Core pilot flow", icon: Workflow },
  { href: "/dashboard/adapters", label: "Production adapterek", icon: Plug },
  { href: "/dashboard/e2e-scenarios", label: "E2E scenario-k", icon: CheckSquare },
  { href: "/dashboard/launch-risks", label: "Launch risk", icon: Shield },
  { href: "/dashboard/contract", label: "API contract", icon: FileCheck2 },
  { href: "/dashboard/error-taxonomy", label: "Error taxonomy", icon: Shield },
  { href: "/dashboard/metering", label: "Usage metering", icon: CreditCard },
  { href: "/dashboard/pilot-onboarding", label: "Pilot onboarding", icon: CheckSquare },
  { href: "/dashboard/release-gates", label: "Release gates", icon: Flag },
  { href: "/dashboard/providers", label: "Provider health", icon: Plug },
  { href: "/dashboard/acceptance", label: "Acceptance tesztek", icon: CheckSquare },
  { href: "/dashboard/deployment", label: "Deploy env", icon: Database },
  { href: "/dashboard/domains", label: "Domain readiness", icon: Globe2 },
  { href: "/dashboard/secrets", label: "Secret rotation", icon: Shield },
  { href: "/dashboard/observability", label: "SLO / observability", icon: Activity },
  { href: "/dashboard/launch", label: "Launch checklist", icon: Flag },
  { href: "/dashboard/cost-control", label: "AI cost control", icon: CreditCard },
  { href: "/dashboard/tenant-boundary", label: "Tenant audit", icon: Shield },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Activity },
  { href: "/dashboard/retention", label: "Retention", icon: Database },
  { href: "/dashboard/audit-exports", label: "Audit exports", icon: FileCheck2 },
  { href: "/dashboard/sandbox", label: "Demo sandbox", icon: Database },
  { href: "/dashboard/investor-demo", label: "Investor demo", icon: Presentation },
  { href: "/dashboard/security", label: "Security", icon: Shield },
  { href: "/dashboard/consents", label: "GDPR consent", icon: Scale },
  { href: "/dashboard/feature-flags", label: "Feature flags", icon: Flag },
  { href: "/dashboard/chat-gaps", label: "Chat gaps", icon: MessageSquareWarning },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/branding", label: "White-label", icon: Palette },
  { href: "/dashboard/translations", label: "FordĂ­tĂˇsok", icon: Languages },
  { href: "/dashboard/buyer-intel", label: "Buyer intel", icon: BrainCircuit },
  { href: "/dashboard/guardrails", label: "Chat guardrails", icon: Shield },
  { href: "/dashboard/partner-api", label: "Partner API", icon: Network },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/sla", label: "SLA / stĂˇtusz", icon: Globe2 },
  { href: "/dashboard/demo-center", label: "Demo center", icon: Presentation },
  { href: "/dashboard/handoff", label: "Handoff", icon: FileCheck2 },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: CheckSquare },
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/dashboard/settings", label: "BeĂˇllĂ­tĂˇsok", icon: Settings }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-brand-gold">EP</div>
          EstatePilot AI
        </Link>
        <nav className="mt-10 space-y-2">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
      </main>
    </div>
  );
}

