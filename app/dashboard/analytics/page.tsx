import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";

export default async function AnalyticsPage() {
  const { user } = await getCurrentUser();
  const listings = await prisma.listing.findMany({
    where: { agentId: user.id },
    include: { leadEvents: true, leads: true, appointments: true }
  });

  const events = listings.flatMap((l) => l.leadEvents.map((event) => ({ ...event, listingTitle: l.title })));
  const byType = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] ?? 0) + 1;
    return acc;
  }, {});

  const listingRows = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    pageViews: listing.leadEvents.filter((e) => e.eventType === "page_view").length,
    tourOpens: listing.leadEvents.filter((e) => e.eventType === "tour_open").length,
    chatQuestions: listing.leadEvents.filter((e) => e.eventType === "chat_question").length,
    leads: listing.leads.length,
    hotLeads: listing.leads.filter((l) => l.leadScore >= 81).length,
    appointments: listing.appointments.length
  }));

  const totalLeads = listingRows.reduce((sum, row) => sum + row.leads, 0);
  const totalPageViews = listingRows.reduce((sum, row) => sum + row.pageViews, 0);
  const conversion = totalPageViews ? Math.round((totalLeads / totalPageViews) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Analytics</h1>
        <p className="text-slate-500">MVP event tracking: page view, tour open, floorplan open, chat, lead submit.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Page view" value={totalPageViews} />
        <MetricCard label="Lead" value={totalLeads} />
        <MetricCard label="Konverzió" value={`${conversion}%`} />
        <MetricCard label="Esemény" value={events.length} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <h2 className="text-xl font-black">Eseménytípusok</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm">
                <span className="font-bold">{type}</span>
                <span>{count}</span>
              </div>
            ))}
            {!Object.keys(byType).length ? <p className="text-sm text-slate-500">Még nincs esemény.</p> : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">Listing teljesítmény</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2">Ingatlan</th>
                  <th>PV</th>
                  <th>Tour</th>
                  <th>Chat</th>
                  <th>Lead</th>
                  <th>Forró</th>
                  <th>Időpont</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listingRows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 font-bold">{row.title}</td>
                    <td>{row.pageViews}</td>
                    <td>{row.tourOpens}</td>
                    <td>{row.chatQuestions}</td>
                    <td>{row.leads}</td>
                    <td>{row.hotLeads}</td>
                    <td>{row.appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
