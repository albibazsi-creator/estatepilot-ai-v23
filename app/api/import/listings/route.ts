import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { guarded, parseJson } from "@/lib/api-response";
import { slugify } from "@/lib/slug";
import { audit } from "@/lib/audit";

const itemSchema = z.object({
  title: z.string().min(3),
  propertyType: z.string().default("lakás"),
  city: z.string().min(2),
  district: z.string().optional().nullable(),
  price: z.coerce.number().int().positive().optional().nullable(),
  sizeM2: z.coerce.number().positive().optional().nullable(),
  rooms: z.coerce.number().positive().optional().nullable(),
  descriptionRaw: z.string().optional().nullable()
});

const schema = z.object({ listings: z.array(itemSchema).min(1).max(50) });

export async function POST(req: Request) {
  return guarded(async () => {
    const { user, agency } = await requireRole("AGENT");
    const parsed = await parseJson(req, schema);
    if (parsed.error) return parsed.error;
    const created = [];
    for (const item of parsed.data!.listings) {
      const baseSlug = slugify(`${item.city}-${item.district ?? ""}-${item.title}`);
      let slug = baseSlug;
      let suffix = 1;
      while (await prisma.listing.findUnique({ where: { slug } })) {
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      }
      const listing = await prisma.listing.create({ data: { ...item, slug, agencyId: agency.id, agentId: user.id } });
      created.push({ id: listing.id, title: listing.title, slug: listing.slug });
    }
    await audit("listings_imported", "Listing", undefined, { count: created.length }, user.id);
    return { created };
  });
}
