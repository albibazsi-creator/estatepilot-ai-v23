import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { guarded } from "@/lib/api-response";

export async function GET(req: Request) {
  return guarded(async () => {
    await requireRole("ADMIN");
    const url = new URL(req.url);
    const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take });
    return logs;
  });
}
