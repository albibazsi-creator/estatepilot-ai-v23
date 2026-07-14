import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { guarded, parseJson } from "@/lib/api-response";
import { buildDemoChecklist, buildDemoSteps } from "@/lib/demo-center";

const schema = z.object({ name: z.string().min(2).default("Ingatlanos sales demo"), targetPersona: z.string().default("independent_agent") });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return prisma.demoRun.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const { data, error } = await parseJson(req, schema);
    if (error) return error;
    return prisma.demoRun.create({ data: { agencyId: agency.id, ...data, stepsJson: buildDemoSteps(), checklistJson: buildDemoChecklist() } });
  });
}
