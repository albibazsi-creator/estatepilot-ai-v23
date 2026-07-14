import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function getCurrentUser() {
  // Production hook: replace this with Clerk/Auth.js session lookup.
  // The app remains RBAC-ready because all data is scoped through agency membership.
  const email = env.DEFAULT_AGENT_EMAIL;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { agencyMembers: { include: { agency: true } } }
  });

  if (!user) {
    throw new Error("Demo user not found. Run `npm run db:seed` first.");
  }

  const agency = user.agencyMembers[0]?.agency;
  if (!agency) throw new Error("Demo agency not found. Run `npm run db:seed` first.");

  return { user, agency };
}
