import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, parseJson, guarded } from "@/lib/api-response";
import { ensureDemoReleaseChannel } from "@/lib/release-channels";

const schema = z.object({ title: z.string().min(3), body: z.string().min(3), category: z.string().default("feature"), version: z.string().default("0.10.0") });

export async function GET() {
  return guarded(async () => {
    const channel = await ensureDemoReleaseChannel();
    const changelog = await prisma.changelogEntry.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return { channel, changelog };
  });
}

export async function POST(req: Request) {
  const channel = await ensureDemoReleaseChannel();
  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const entry = await prisma.changelogEntry.create({ data: { releaseChannelId: channel.id, ...parsed.data } });
  return ok({ entry }, { status: 201 });
}
