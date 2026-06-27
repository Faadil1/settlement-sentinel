import React from "react";
import StatusBadge from "./StatusBadge";
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
}: {
  result: RunClaimResponse | null;
  isLoading: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={panelStyle}>
        <div style={eyebrowStyle}>THE TXLINE PROOF PATH</div>

        {result && (
          <div style={{ marginBottom: 16 }}>
            <StatusBadge status={result.finalStatus} />
          </div>
        )}

        <div style={whyTxlineStyle}>
          The verdict is not produced by Settlement Sentinel's opinion.
          It comes from TxLINE's Merkle proof and deployed Solana
          program/root.
        </div>
      </div>

      <VerdictReceipt result={result} statKey={KNOWN_WORKING_CANDIDATE.statKey} seq={KNOWN_WORKING_CANDIDATE.seq} />

      <div style={panelStyle}>
        <div style={eyebrowStyle}>RESOLUTION TIMELINE</div>
        <PipelineTracker steps={result?.steps ?? []} isLoading={isLoading} />
      </div>

      <EvidenceDrawer result={result} />
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "#161A20",
  border: "1px solid #2A2F38",
  borderRadius: 8,
  padding: 20,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.1em",
  color: "#7A828E",
  marginBottom: 14,
};

const whyTxlineStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#A8AFB8",
  lineHeight: 1.6,
};
