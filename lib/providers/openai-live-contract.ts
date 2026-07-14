export type OpenAiLiveContract = {
  textModelEnv: "OPENAI_MODEL_TEXT";
  visionModelEnv: "OPENAI_MODEL_VISION";
  requiredTraces: string[];
  evalSuites: string[];
  safetyRules: string[];
};

export const openAiLiveContract: OpenAiLiveContract = {
  textModelEnv: "OPENAI_MODEL_TEXT",
  visionModelEnv: "OPENAI_MODEL_VISION",
  requiredTraces: ["prompt_hash", "model", "latency_ms", "cost_estimate", "decision_id", "guardrail_result"],
  evalSuites: ["property_chat_unknowns", "listing_description_truthfulness", "vision_room_classification", "seller_report_plain_hungarian"],
  safetyRules: [
    "Do not invent amenities, renovation dates, structural condition, view, or financing terms.",
    "Answer buyer questions only from property knowledge base or clearly route to the agent.",
    "Every staged or synthetic visual must keep an AI látványterv disclosure.",
    "Log high-impact AI decisions to the AI Decision Ledger before acting on them."
  ]
};
