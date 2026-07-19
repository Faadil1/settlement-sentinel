import type { FinalStatus } from "../types";
const COPY: Record<FinalStatus, string> = {
  VERIFIED: "TxLINE Merkle proof validated against the on-chain program/root.",
  PROOF_MISMATCH: "The program was reached and a valid root was found, but the submitted proof did not match it (error 6004 — InvalidMainTreeProof).",
  SPONSOR_CLARIFICATION_PENDING: "Waiting on a known-good example from TxLINE support before this can be diagnosed further.",
  ERROR: "The pipeline did not complete due to an unexpected failure.",
};
export default function StatusBadge({ status, isLoading, statement }: { status: FinalStatus | null; isLoading: boolean; statement?: string }) {
  if (!status) return <div className={`verdict verdict-idle ${isLoading ? "verdict-loading" : ""}`}><p className="verdict-kicker">{isLoading ? "Evidence in motion" : "Awaiting verification"}</p><p className="verdict-idle-copy">{isLoading ? "Following the proof current…" : "The verdict will emerge here."}</p></div>;
  return <div className={`verdict verdict-${status.toLowerCase()}`}><p className="verdict-kicker">Final verdict</p><h2>{status}</h2><p className="verdict-statement">{statement || COPY[status]}</p>{status === "VERIFIED" && <ul className="verdict-facts"><li>validate_stat returned true</li><li>Read-only Solana simulation</li></ul>}</div>;
}
