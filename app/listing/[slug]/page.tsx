import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { TourViewer } from "@/components/tour-viewer";
import { LeadForm } from "@/components/public/lead-form";
import { PropertyChat } from "@/components/public/property-chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EventOnView, EventTracker } from "@/components/public/event-tracker";

export default async function PublicListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      tours: true,
      floorplans: true,
      agent: true
    }
  });

  if (!listing || !listing.isPublished) notFound();

  const cover = listing.media.find((m) => m.isCover) ?? listing.media[0];
  const images = listing.media.filter((m) => m.mediaType === "IMAGE");
  const panoramas = listing.media.filter((m) => m.mediaType === "PANORAMA_360");
  const floorplans = listing.media.filter((m) => m.mediaType === "FLOORPLAN");

  return (
    <main className="bg-white">
      <EventTracker slug={slug} eventType="page_view" />
      <section className="relative min-h-[82vh] overflow-hidden bg-slate-950 text-white">
        {cover ? <img src={cover.url} alt={listing.title} className="absolute inset-0 h-full w-full object-cover opacity-45" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-6 py-14">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">AI prémium ingatlanbemutató</div>
            <h1 className="text-5xl font-black tracking-tight md:text-7xl">{listing.title}</h1>
            <p className="mt-5 text-xl text-slate-200">{listing.city}{listing.district ? `, ${listing.district}` : ""} • {listing.sizeM2 ?? "–"} m² • {listing.rooms ?? "–"} szoba</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#lead" size="lg">Időpontot kérek</Button>
              <Button href="#tour" variant="secondary" size="lg">3D/360 túra</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-10 md:grid-cols-4">
        <Info label="Ár" value={formatPrice(listing.price)} />
        <Info label="Méret" value={`${listing.sizeM2 ?? "–"} m²`} />
        <Info label="Szobák" value={`${listing.rooms ?? "–"}`} />
        <Info label="Állapot" value={listing.condition ?? "Nincs megadva"} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Info label="Erkély / terasz" value={listing.balcony ?? "Nincs megadva"} />
          <Info label="Fűtés" value={listing.heating ?? "Nincs megadva"} />
          <Info label="Parkolás" value={listing.parking ?? "Nincs megadva"} />
          <Info label="Környék" value={listing.neighborhood ?? listing.district ?? "Nincs megadva"} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <EventOnView slug={slug} eventType="gallery_view">
          <div className="grid gap-4 md:grid-cols-3">
            {images.slice(0, 6).map((image, index) => (
              <figure key={image.id} className="overflow-hidden rounded-3xl bg-slate-100">
                <img src={image.url} alt={image.roomLabel ?? `Kép ${index + 1}`} className="h-72 w-full object-cover" />
                {image.isStaged || image.disclosureRequired ? <figcaption className="px-4 py-2 text-xs font-semibold text-slate-600">AI látványterv - az eredeti fotó megőrizve</figcaption> : null}
              </figure>
            ))}
          </div>
        </EventOnView>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <Card>
            <h2 className="text-3xl font-black">Leírás</h2>
            <p className="mt-5 whitespace-pre-line leading-8 text-slate-700">{listing.descriptionAi ?? listing.descriptionRaw ?? "A részletes leírás hamarosan érkezik."}</p>
          </Card>

          <EventOnView slug={slug} eventType="tour_open">
            <div id="tour" className="space-y-4">
              <h2 className="text-3xl font-black">3D / 360 bejárás</h2>
              <TourViewer tours={listing.tours} panoramas={panoramas} />
            </div>
          </EventOnView>

          <EventOnView slug={slug} eventType="floorplan_open">
            <Card>
              <h2 className="text-3xl font-black">Alaprajz</h2>
              {floorplans[0] ? <FloorplanPreview url={floorplans[0].url} /> : <p className="mt-4 text-slate-500">Alaprajz nincs feltöltve.</p>}
            </Card>
          </EventOnView>

          <Card>
            <h2 className="text-3xl font-black">Kérdezz az ingatlanról</h2>
            <p className="mt-2 text-sm text-slate-500">Az AI chat csak a hirdetés adataiból dolgozik, hiányzó adatot nem talál ki.</p>
            <div className="mt-5"><PropertyChat slug={slug} /></div>
          </Card>
        </div>

        <aside id="lead" className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-6 lg:sticky lg:top-6">
          <h2 className="text-2xl font-black">Érdeklődés / megtekintés</h2>
          <p className="mt-2 text-sm text-slate-500">Küldd el az adatokat, az ingatlanos visszahív.</p>
          <div className="mt-5"><LeadForm slug={slug} /></div>
          <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-slate-600">
            <b>Ingatlanos:</b> {listing.agent.name}<br />
            <b>Email:</b> {listing.agent.email}
          </div>
        </aside>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}


function FloorplanPreview({ url }: { url: string }) {
  if (url.toLowerCase().endsWith(".pdf")) {
    return <iframe src={url} title="Alaprajz" className="mt-5 h-[520px] w-full rounded-2xl border border-slate-200" />;
  }

  return <img src={url} alt="Alaprajz" className="mt-5 rounded-2xl border border-slate-200" />;
}
