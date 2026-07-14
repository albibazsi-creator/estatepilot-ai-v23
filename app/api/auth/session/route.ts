import { getCurrentUser } from "@/lib/current-user";
import { guarded } from "@/lib/api-response";

export async function GET() {
  return guarded(async () => {
    const { user, agency } = await getCurrentUser();
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      agency: { id: agency.id, name: agency.name, subscriptionPlan: agency.subscriptionPlan },
      mode: "demo-session-stub",
      nextStep: "Replace getCurrentUser() with Clerk/Auth.js session lookup in production."
    };
  });
}
