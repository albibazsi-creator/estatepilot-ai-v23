export type LiveMode = "mock" | "dry_run" | "live";
export type CertificationStatus = "certified" | "partial" | "blocked";

export type ProviderCertification = {
  key: string;
  label: string;
  owner: string;
  mode: LiveMode;
  requiredEnv: string[];
  missingEnv: string[];
  startRequired: boolean;
  slaTarget: string;
  smokeTest: string;
  rollback: string;
};

export type AmericanGradeGate = {
  key: string;
  label: string;
  target: string;
  score: number;
  status: CertificationStatus;
  evidence: string[];
  blockers: string[];
  acceptanceCriteria: string[];
};

export function certificationStatus(score: number): CertificationStatus {
  if (score >= 90) return "certified";
  if (score >= 65) return "partial";
  return "blocked";
}
