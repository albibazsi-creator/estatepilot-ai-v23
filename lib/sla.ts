export function computeSlaStatus(incidents: Array<{ status: string; severity: string }>) {
  const open = incidents.filter((i) => i.status !== "resolved");
  if (open.some((i) => i.severity === "critical")) return { label: "major_outage", score: 20, message: "Kritikus incidens van nyitva." };
  if (open.some((i) => i.severity === "major")) return { label: "degraded", score: 55, message: "Fontos szolgáltatás részlegesen érintett." };
  if (open.length) return { label: "minor", score: 82, message: "Kisebb nyitott incidens van." };
  return { label: "operational", score: 99, message: "Minden fő rendszer működőképesnek jelölt." };
}
