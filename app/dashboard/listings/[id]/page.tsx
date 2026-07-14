import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/dashboard/listing-form";
import { MediaManager } from "@/components/dashboard/media-manager";
import { TourForm } from "@/components/dashboard/tour-form";
import { AiActions } from "@/components/dashboard/ai-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { ReportGenerateButton, ReportSendButton } from "@/components/dashboard/report-actions";
import { EnqueueJobButton } from "@/components/dashboard/job-actions";
import { GenerateCampaignButton } from "@/components/dashboard/marketing-actions";
import { calculateListingReadiness } from "@/lib/readiness";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      tours: { include: { nodes: { orderBy: { sortOrder: "asc" } }, hotspots: true } },
      aiOutputs: { orderBy: { createdAt: "desc" } },
      leads: { orderBy: { createdAt: "desc" }, take: 8 },
      sellerReports: { orderBy: { createdAt: "desc" }, take: 3 },
      floorplans: true,
      aiJobs: { orderBy: { createdAt: "desc" }, take: 5 },
      marketingCampaigns: { orderBy: { createdAt: "desc" }, take: 3 },
      followUpTasks: { orderBy: [{ status: "asc" }, { priority: "desc" }], take: 5 },
      chatSessions: { include: { messages: { orderBy: { createdAt: "asc" }, take: 2 } }, orderBy: { createdAt: "desc" }, take: 5 }
    }
  });

  if (!listing) notFound();
  const readiness = calculateListingReadiness(listing);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{listing.title}</h1>
          <p className="text-slate-500">/{listing.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button href={`/listing/${listing.slug}`} variant="secondary">Public oldal</Button>
          <PublishButton listingId={listing.id} isPublished={listing.isPublished} />
        </div>
      </div>

      <Card className="bg-slate-950 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-white/60">AI readiness score</div>
            <div className="mt-1 text-4xl font-black">{readiness.score}/100</div>
            <div className="mt-2 text-sm text-brand-gold">{readiness.status}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <EnqueueJobButton listingId={listing.id} type="analyze_images" label="Queue: képelemzés" />
            <EnqueueJobButton listingId={listing.id} type="generate_listing_bundle" label="Queue: teljes AI bundle" />
            <EnqueueJobButton listingId={listing.id} type="generate_seller_report" label="Queue: riport" />
            <EnqueueJobButton listingId={listing.id} type="generate_campaign_plan" label="Queue: kampány" />
            <EnqueueJobButton listingId={listing.id} type="create_followup_tasks" label="Queue: follow-up" />
          </div>
        </div>
        {readiness.missing.length ? <div className="mt-4 text-sm text-white/70">Hiányzik: {readiness.missing.join(", ")}</div> : null}
      </Card>

      <AiActions listingId={listing.id} />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Értékesítési export és kampány</h2>
            <p className="text-sm text-slate-500">Egy kattintásos listing package, Meta/Reels/email kreatívokkal.</p>
          </div>
          <GenerateCampaignButton listingId={listing.id} />
        </div>
      </Card>
      <ListingForm listing={listing} />
      <MediaManager listingId={listing.id} media={listing.media} />
      <TourForm listingId={listing.id} tours={listing.tours} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">AI outputok</h2>
          <div className="mt-4 space-y-3">
            {listing.aiOutputs.map((out) => (
              <details key={out.id} className="rounded-2xl border border-slate-200 p-4">
                <summary className="cursor-pointer font-bold">{out.outputType} • {formatDate(out.createdAt)}</summary>
                <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs">{JSON.stringify(out.contentJson, null, 2)}</pre>
              </details>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Leadek</h2>
            <Button href="/dashboard/leads" variant="secondary" size="sm">Összes</Button>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {listing.leads.map((lead) => (
              <div key={lead.id} className="py-3">
                <div className="font-bold">{lead.name} • {lead.leadScore}/100</div>
                <div className="text-sm text-slate-500">{lead.phone ?? lead.email ?? "nincs kontakt"}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-black">Legutóbbi AI jobok</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {listing.aiJobs.map((job) => (
            <div key={job.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="font-bold">{job.type} • {job.status}</div>
              <div className="mt-1 text-slate-500">Prio {job.priority} • {formatDate(job.createdAt)}</div>
              {job.error ? <div className="mt-1 text-red-600">{job.error}</div> : null}
            </div>
          ))}
          {listing.aiJobs.length === 0 ? <p className="text-sm text-slate-500">Még nincs AI job.</p> : null}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Kampánycsomagok</h2>
          <div className="mt-4 space-y-3">
            {listing.marketingCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="font-bold">{campaign.name} • {campaign.status}</div>
                <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap text-xs text-slate-500">{JSON.stringify(campaign.assetsJson, null, 2)}</pre>
              </div>
            ))}
            {listing.marketingCampaigns.length === 0 ? <p className="text-sm text-slate-500">Még nincs kampánycsomag.</p> : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">AI chat sessionök</h2>
          <div className="mt-4 space-y-3">
            {listing.chatSessions.map((session) => (
              <div key={session.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="font-bold">{formatDate(session.createdAt)}</div>
                <div className="mt-1 text-slate-500">{session.summary ?? "chat"}</div>
                {session.messages.map((message) => <div key={message.id} className="mt-2 text-xs text-slate-600"><b>{message.role}:</b> {message.content}</div>)}
              </div>
            ))}
            {listing.chatSessions.length === 0 ? <p className="text-sm text-slate-500">Még nincs AI chat aktivitás.</p> : null}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Seller report</h2>
            <p className="text-sm text-slate-500">Heti tulajdonosi riport generálás.</p>
          </div>
<ReportGenerateButton listingId={listing.id} />
        </div>
        <div className="mt-4 space-y-3">
          {listing.sellerReports.map((report) => (
            <div key={report.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{formatDate(report.periodStart)} – {formatDate(report.periodEnd)}</div>
                  <p className="mt-1 text-slate-600">{report.aiSummary}</p>
                  {report.sentAt ? <p className="mt-1 text-xs text-green-700">Elküldve: {formatDate(report.sentAt)}</p> : null}
                </div>
                <div className="flex gap-2">
                  <Button href={`/api/reports/${report.id}/export`} size="sm" variant="secondary">HTML export</Button>
                  <ReportSendButton reportId={report.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PublishButton({ listingId, isPublished }: { listingId: string; isPublished: boolean }) {
  return (
    <form action={async () => {
      "use server";
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/listings/${listingId}/publish`, { method: "POST" });
    }}>
      <Button type="submit">{isPublished ? "Újrapublikálás" : "Publikálás"}</Button>
    </form>
  );
}
