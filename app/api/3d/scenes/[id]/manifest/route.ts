import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(async () => {
    const { id } = await params;
    const { agency } = await getCurrentUser();
    const model = (prisma as unknown as { spatialSceneManifest?: { findFirst: (args: unknown) => Promise<unknown | null> } }).spatialSceneManifest;
    const manifest = model ? await model.findFirst({ where: { agencyId: agency.id, OR: [{ id }, { sceneId: id }] }, orderBy: { createdAt: "desc" } }) : null;
    if (!manifest) throw new Error("Scene manifest not found");
    return manifest;
  });
}
