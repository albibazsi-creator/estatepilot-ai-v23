export type GuardrailRule = {
  key: string;
  enabled?: boolean;
  blockPatterns: string[];
  safeReply: string;
  severity?: string;
};

const defaultRules: GuardrailRule[] = [
  {
    key: "no_unverified_price_claim",
    blockPatterns: ["alkudható biztos", "garantáltan olcsóbb", "biztosan megéri"],
    safeReply: "Ezt nem állítom biztos tényként. Az ár és az alku lehetősége az ingatlanostól/tulajdonostól függ."
  },
  {
    key: "no_hidden_defect_denial",
    blockPatterns: ["nincs semmi hiba", "biztosan hibátlan", "garantáltan penészmentes"],
    safeReply: "Csak a hirdetésben szereplő adatokból válaszolok. Műszaki állapotnál személyes megtekintés vagy szakértői vizsgálat javasolt."
  },
  {
    key: "no_fake_feature",
    blockPatterns: ["van medence", "van garázs", "panorámás"],
    safeReply: "Ezt csak akkor állíthatom, ha az adatlapban biztosan szerepel. Jelenleg inkább továbbítom a kérdést az ingatlanosnak."
  }
];

export function evaluateGuardrails(message: string, rules: GuardrailRule[] = defaultRules) {
  const normalized = message.toLowerCase();
  for (const rule of rules.filter((r) => r.enabled !== false)) {
    if (rule.blockPatterns.some((pattern) => normalized.includes(pattern.toLowerCase()))) {
      return { blocked: true, ruleKey: rule.key, safeReply: rule.safeReply, severity: rule.severity || "medium" };
    }
  }
  return { blocked: false, ruleKey: null, safeReply: null, severity: null };
}

export function defaultGuardrailRules() {
  return defaultRules;
}
