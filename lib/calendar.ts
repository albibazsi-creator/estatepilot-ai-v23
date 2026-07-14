export function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildAppointmentIcs(input: { title: string; description?: string; location?: string; start: Date; end: Date }) {
  const uid = `${toIcsDate(input.start)}-${Math.random().toString(36).slice(2)}@estatepilot.ai`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EstatePilot AI//Appointment//HU",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(input.start)}`,
    `DTEND:${toIcsDate(input.end)}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    input.description ? `DESCRIPTION:${escapeIcs(input.description)}` : null,
    input.location ? `LOCATION:${escapeIcs(input.location)}` : null,
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean);
  return lines.join("\r\n");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
