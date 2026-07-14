import { prisma } from "../lib/prisma";
import { processNextJob } from "../lib/jobs";

async function main() {
  const agencyId = process.argv[2];
  const job = await processNextJob(agencyId);
  if (!job) {
    console.log("No pending jobs.");
    return;
  }
  console.log(JSON.stringify({ id: job.id, type: job.type, status: job.status, error: job.error }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
