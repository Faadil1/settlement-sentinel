import React from "react";
import VerdictReceipt from "./VerdictReceipt";
import PipelineTracker from "./PipelineTracker";
import EvidenceDrawer from "./EvidenceDrawer";
import type { RunClaimResponse } from "../types";

const KNOWN_WORKING_CANDIDATE = {
  seq: 1141,
  statKey: 1002,
};

export default function ProofPanel({
  result,
  isLoading,
  isUnavailable,
}: {
  result: RunClaimResponse | null;
  isLoading: boolean;
  isUnavailable?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* The main verdict receipt — the hero element */}
      <VerdictReceipt
        result={result}
        isUnavailable={isUnavailable}
        statKey={KNOWN_WORKING_CANDIDATE.statKey}
        seq={KNOWN_WORKING_CANDIDATE.seq}
      />

      {/* Resolution timeline — wrapped in collapsible details, auto-opened only when a real result exists */}
      <details open={!!result} style={detailsStyle}>
        <summary style={summaryStyle}>
          RESOLUTION TIMELINE {result ? "— TxLINE PROOF PATH" : ""}
        </summary>
        <div style={{ paddingTop: 12 }}>
          <PipelineTracker
            steps={result?.steps ?? []}
            isLoading={isLoading}
            isUnavailable={isUnavailable}
          />
        </div>
      </details>

      {/* Audit evidence drawer */}
      <EvidenceDrawer result={result} isUnavailable={isUnavailable} />
    </div>
  );
}

const detailsStyle: React.CSSProperties = {
  borderTop: "1px solid rgba(200, 194, 182, 0.08)",
  paddingTop: 14,
};

const summaryStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.12em",
  color: "#7A756A",
  fontWeight: 600,
  cursor: "pointer",
  outline: "none",
  userSelect: "none",
  textTransform: "uppercase",
};
