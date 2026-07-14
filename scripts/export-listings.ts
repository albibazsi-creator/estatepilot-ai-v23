import { PrismaClient } from "@prisma/client";
import { listingsToCsv } from "../lib/exporters";
import { writeFile } from "fs/promises";

const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({ include: { leads: true, media: true }, orderBy: { createdAt: "desc" } });
  await writeFile("estatepilot-listings-export.csv", listingsToCsv(listings), "utf-8");
  console.log(`Exported ${listings.length} listings to estatepilot-listings-export.csv`);
}

main().finally(async () => prisma.$disconnect());
