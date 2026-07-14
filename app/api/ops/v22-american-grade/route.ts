import { guarded } from "@/lib/api-response";
import { getV22AmericanGradeReadiness } from "@/lib/v22-american-grade";

export async function GET() {
  return guarded(async () => getV22AmericanGradeReadiness());
}
