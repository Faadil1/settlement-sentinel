/**
 * Settlement Sentinel — shared types
 * Single source of truth for the 7-stage pipeline contract.
 * No escrow / wagering / settlement types exist here by design.
 */

export type EvidenceLabel =
  | "LIVE"
  | "PARTIAL"
  | "LOCAL_STUB"
  | "PRESEEDED"
  | "SIMULATED"
  | "NOT_IMPLEMENTED"
  | "UNKNOWN";

export type ClaimStrength =
  | "UNSUPPORTED"
  | "DESCRIBED"
  | "DEMONSTRATED"
  | "VERIFIED"
  | "MEASURED";

/**
 * Final pipeline outcome. VERIFIED is reserved exclusively for a real,
 * live, true boolean result from the on-chain validate_stat .view()
 * call. Do not set VERIFIED for any other reason.
 */
export type FinalStatus =
  | "VERIFIED"
  | "PROOF_MISMATCH"
  | "SPONSOR_CLARIFICATION_PENDING"
  | "ERROR";

export const PIPELINE_STAGE_IDS = [
  "market_condition_selected",
  "fixture_loaded",
  "score_snapshot_loaded",
  "stat_validation_payload_retrieved",
  "txline_program_reached",
  "onchain_root_found",
  "final_validation",
] as const;

export type PipelineStageId = (typeof PIPELINE_STAGE_IDS)[number];

export interface StepResult {
  id: PipelineStageId;
  label: string;
  ok: boolean;
  detail: string;
  evidenceLabel: EvidenceLabel;
  claimStrength: ClaimStrength;
  error?: string;
  /** Raw program log lines, only present for the on-chain stages. */
  programLogs?: string[];
}

export interface FixtureSummary {
  fixtureId: number;
  participant1: string;
  participant2: string;
  startTime: number;
}

export interface RunClaimRequest {
  fixtureId?: number;
  seq?: number;
  statKey?: number;
}

export interface RunClaimResponse {
  steps: StepResult[];
  finalStatus: FinalStatus;
  fixture: FixtureSummary | null;
  proofPayloadFields: string[];
  validationSimulationLogs: string[];
  truthfulProofStatement: string;
  evidence: {
    primaryLabel: EvidenceLabel;
    claimStrength: ClaimStrength;
    sourceConfidence: "CONFIRMED" | "UNCERTAIN" | "NOT_FOUND";
  };
  generatedAt: string;
}

/** The single known-working candidate confirmed during the G2 spike. */
export const KNOWN_WORKING_CANDIDATE = {
  fixtureId: 17588309,
  match: "Egypt vs Iran",
  seq: 1141,
  statKey: 1002,
};
