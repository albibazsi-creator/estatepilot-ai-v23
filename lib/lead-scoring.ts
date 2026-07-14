type LeadInput = {
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  buyingIntent?: string | null;
  financingType?: string | null;
  moveTimeline?: string | null;
  events?: { eventType: string }[];
};

export function calculateLeadScore(lead: LeadInput) {
  let score = 12;
  const reasons: string[] = [];

  if (lead.phone) { score += 22; reasons.push("megadott telefonszám"); }
  if (lead.email) { score += 10; reasons.push("megadott email"); }
  if (lead.message && lead.message.length > 25) { score += 12; reasons.push("konkrét üzenet"); }
  if (lead.financingType && !/nem tudom|még/i.test(lead.financingType)) { score += 10; reasons.push("finanszírozás tisztázott"); }
  if (lead.buyingIntent?.toLowerCase().includes("befekt")) { score += 8; reasons.push("befektetői szándék"); }
  if (lead.moveTimeline && /azonnal|1 hónap|sürgős|most/i.test(lead.moveTimeline)) { score += 12; reasons.push("sürgős költözési idővonal"); }

  const events = lead.events ?? [];
  const eventPoints: Record<string, number> = {
    page_view: 2,
    gallery_view: 5,
    tour_open: 12,
    tour_complete: 18,
    floorplan_open: 10,
    chat_question: 8,
    booking_created: 26,
    call_clicked: 16
  };

  for (const event of events) score += eventPoints[event.eventType] ?? 0;

  score = Math.max(0, Math.min(100, score));

  const temperature = score >= 81 ? "forró" : score >= 61 ? "meleg" : score >= 31 ? "érdeklődő" : "hideg";
  const nextBestAction = score >= 81
    ? "Hívd fel első körben, és ajánlj konkrét megtekintési idősávot."
    : score >= 61
      ? "Küldj személyes follow-upot, kérdezz rá a finanszírozásra és időpontra."
      : score >= 31
        ? "Küldj extra képeket, alaprajzot vagy 3D túra linket."
        : "Tedd nurturing listára, ne ez legyen a napi prioritás.";

  return {
    score,
    temperature,
    reason: reasons.length ? reasons.join(", ") : "alap érdeklődői aktivitás",
    nextBestAction
  };
}
