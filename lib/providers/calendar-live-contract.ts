export const calendarLiveContract = {
  provider: "Google Calendar",
  requiredForFullAutomation: ["oauth_connect", "token_refresh", "free_busy", "create_event", "cancel_event", "ics_fallback"],
  pilotFallback: "internal_slot_system_with_ics_export"
} as const;
