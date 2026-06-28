import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import type { RunClaimResponse } from "../types";

const FIXTURE_LABEL = "Egypt vs Iran";

function buildReceiptText(result: RunClaimResponse, statKey: number, seq: number): string {
  const verifiedLine =
    result.finalStatus === "VERIFIED"
      ? "VERIFIED ✓"
      : result.finalStatus === "PROOF_MISMATCH"
      ? "PROOF_MISMATCH"
      : result.finalStatus === "SPONSOR_CLARIFICATION_PENDING"
      ? "SPONSOR_CLARIFICATION_PENDING"
      : "ERROR";

  return [
    "───────────────────────────────────",
    "  SETTLEMENT SENTINEL — VERDICT RECEIPT",
    "───────────────────────────────────",
    `  Fixture: ${FIXTURE_LABEL}`,
    `  Claim: statKey ${statKey} at seq ${seq}`,
    "",
    `  ${verifiedLine}`,
    "",
    `  ${result.truthfulProofStatement}`,
    "",
    "  Read-only simulation. No transaction broadcast.",
    `  Verified: ${result.generatedAt}`,
    "───────────────────────────────────",
  ].join("\n");
}

export default function VerdictReceipt({
  result,
  isUnavailable,
  statKey,
  seq,
}: {
  result: RunClaimResponse | null;
  isUnavailable?: boolean;
  statKey: number;
  seq: number;
}) {
  const [copied, setCopied] = useState(false);

  // Local/API Unavailable State
  if (isUnavailable) {
    return (
      <div style={paperStyle}>
        <div style={letterheadStyle}>VERDICT RECEIPT</div>
        <div style={ruleStyle} />

        <div style={rowStyle}>
          <span style={rowLabelStyle}>Fixture</span>
          <span style={rowPendingValueStyle}>{FIXTURE_LABEL}</span>
        </div>
        <div style={rowStyle}>
          <span style={rowLabelStyle}>Disputed Stat</span>
          <span style={rowPendingValueStyle}>statKey {statKey} at seq {seq}</span>
        </div>

        <div style={ruleStyle} />

        {/* Status: UNAVAILABLE */}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <StatusBadge status="UNAVAILABLE" />
        </div>

        <div style={ruleStyle} />

        {/* Message */}
        <div style={{ padding: "14px 0 6px", fontSize: 14, color: "#8E3D2A", lineHeight: 1.5, fontWeight: 700, textAlign: "center" }}>
          Proof check unavailable in this local preview.
        </div>

        {/* Supporting Line */}
        <div style={{ fontSize: 11, color: "#8A8072", lineHeight: 1.4, marginBottom: 12, textAlign: "center", fontWeight: 500 }}>
          Run the API server or use the deployed Cloud Run demo.
        </div>

        <div style={ruleStyle} />
        
        <div style={disclaimerStyle}>
          Read-only simulation. No transaction broadcast.
        </div>

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button disabled style={copyBtnStyle(true)}>
            Copy receipt
          </button>
        </div>
      </div>
    );
  }

  // Pending State (Before any run)
  if (!result) {
    return (
      <div style={paperStyle}>
        <div style={letterheadStyle}>VERDICT RECEIPT</div>
        <div style={ruleStyle} />

        <div style={rowStyle}>
          <span style={rowLabelStyle}>Fixture</span>
          <span style={rowPendingValueStyle}>{FIXTURE_LABEL}</span>
        </div>
        <div style={rowStyle}>
          <span style={rowLabelStyle}>Disputed Stat</span>
          <span style={rowPendingValueStyle}>statKey {statKey} at seq {seq}</span>
        </div>

        <div style={ruleStyle} />

        {/* Status: PENDING */}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <StatusBadge status="PENDING" />
        </div>

        <div style={ruleStyle} />

        {/* Message */}
        <div style={{ padding: "14px 0 6px", fontSize: 14, color: "#7A7062", lineHeight: 1.5, fontWeight: 500, fontStyle: "italic", textAlign: "center" }}>
          Awaiting proof check...
        </div>

        {/* Supporting Line */}
        <div style={{ fontSize: 11, color: "#8A8072", lineHeight: 1.4, marginBottom: 12, textAlign: "center" }}>
          No proof has been run yet.
        </div>

        <div style={ruleStyle} />
        
        <div style={disclaimerStyle}>
          Read-only simulation. No transaction broadcast.
        </div>

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button disabled style={copyBtnStyle(true)}>
            Copy receipt
          </button>
        </div>
      </div>
    );
  }

  // Verified / Checked Result State
  const receiptText = buildReceiptText(result, statKey, seq);
  const isVerified = result.finalStatus === "VERIFIED";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fail silently if clipboard API is blocked
    }
  }

  return (
    <div style={paperStyle}>
      <div style={letterheadStyle}>VERDICT RECEIPT</div>
      <div style={ruleStyle} />

      <div style={rowStyle}>
        <span style={rowLabelStyle}>Fixture</span>
        <span style={rowValueStyle}>{FIXTURE_LABEL}</span>
      </div>
      <div style={rowStyle}>
        <span style={rowLabelStyle}>Disputed Stat</span>
        <span style={rowValueStyle}>statKey {statKey} at seq {seq}</span>
      </div>

      <div style={ruleStyle} />

      {/* Verified Status Stamp */}
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <StatusBadge status={result.finalStatus} />
      </div>

      <div style={ruleStyle} />

      {/* The exact proof statement to preserve */}
      <div style={{ padding: "14px 0", fontSize: 14, color: "#2C251C", lineHeight: 1.5, fontWeight: 500 }}>
        {result.truthfulProofStatement}
      </div>

      <div style={{ fontSize: 11, color: "#7A7062", lineHeight: 1.4, marginBottom: 8 }}>
        This verdict receipt is generated using TxLINE's Merkle proof payload and validated against the deployed program/root.
      </div>

      <div style={ruleStyle} />

      <div style={disclaimerStyle}>
        Read-only simulation. No transaction broadcast.
      </div>
      <div style={{ fontSize: 10, color: "#8A8072", marginTop: 3 }}>
        Verified: {result.generatedAt}
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button onClick={handleCopy} style={copyBtnStyle(false)}>
          {copied ? "Copied" : "Copy receipt"}
        </button>
      </div>
    </div>
  );
}

/* ── Ivory Receipt Sheet Styles ── */

const paperStyle: React.CSSProperties = {
  background: "#FDFCF7",
  borderRadius: 6,
  padding: "24px 28px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
  color: "#1C1B19",
  borderTop: "6px solid #B8862D", // Muted amber header tab/stripe
};

const letterheadStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.16em",
  color: "#8A8072",
  textAlign: "center",
  paddingBottom: 10,
};

const ruleStyle: React.CSSProperties = {
  height: 1,
  background: "#E5DEC9",
  borderBottom: "1px dashed rgba(0,0,0,0.04)",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  padding: "10px 0",
};

const rowLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.06em",
  color: "#8A8072",
  textTransform: "uppercase" as const,
};

const rowValueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#1C1B19",
};

const rowPendingValueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#8A8072",
};

const disclaimerStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#8A8072",
  marginTop: 10,
  lineHeight: 1.4,
};

function copyBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "transparent" : "rgba(28, 25, 23, 0.05)",
    color: disabled ? "#C5BCA9" : "#4A4035",
    border: `1px solid ${disabled ? "#E5DEC9" : "#B8862D"}`,
    borderRadius: 4,
    padding: "6px 12px",
    fontSize: 11,
    fontWeight: 700,
    cursor: disabled ? "default" : "pointer",
  };
}
