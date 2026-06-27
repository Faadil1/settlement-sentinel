import React, { useState } from "react";
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
    "═══════════════════════════════════",
    "  SETTLEMENT SENTINEL — VERDICT",
    "═══════════════════════════════════",
    `  Fixture: ${FIXTURE_LABEL}`,
    `  Claim: statKey ${statKey} at seq ${seq}`,
    "",
    `  ${verifiedLine}`,
    "",
    `  ${result.truthfulProofStatement}`,
    "",
    "  Read-only simulation. No transaction broadcast.",
    `  Verified: ${result.generatedAt}`,
    "═══════════════════════════════════",
  ].join("\n");
}

export default function VerdictReceipt({
  result,
  statKey,
  seq,
}: {
  result: RunClaimResponse | null;
  statKey: number;
  seq: number;
}) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div style={panelStyle}>
        <pre style={pendingPreStyle}>
          {[
            "═══════════════════════════════════",
            "  SETTLEMENT SENTINEL — VERDICT",
            "═══════════════════════════════════",
            `  Fixture: ${FIXTURE_LABEL}`,
            `  Claim: statKey ${statKey} at seq ${seq}`,
            "",
            "  Awaiting a proof run…",
            "",
            "  Read-only simulation. No transaction broadcast.",
            "═══════════════════════════════════",
          ].join("\n")}
        </pre>
        <button disabled style={copyButtonStyle("disabled")}>
          Copy verdict
        </button>
      </div>
    );
  }

  const receiptText = buildReceiptText(result, statKey, seq);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (older browsers, insecure
      // context); fail silently rather than throwing in the UI.
    }
  }

  return (
    <div style={panelStyle}>
      <pre style={preStyle}>{receiptText}</pre>
      <button onClick={handleCopy} style={copyButtonStyle("active")}>
        {copied ? "Copied" : "Copy verdict"}
      </button>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "#161A20",
  border: "1px solid #2A2F38",
  borderRadius: 8,
  padding: 20,
};

const preStyle: React.CSSProperties = {
  margin: 0,
  marginBottom: 14,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 13,
  lineHeight: 1.6,
  color: "#D8DEE6",
  whiteSpace: "pre-wrap",
};

const pendingPreStyle: React.CSSProperties = {
  ...preStyle,
  color: "#5A6472", // dimmer than the active receipt, signals "not yet real"
};

function copyButtonStyle(state: "active" | "disabled"): React.CSSProperties {
  return {
    background: state === "disabled" ? "#161A20" : "#1E2630",
    color: state === "disabled" ? "#5A6472" : "#CBD9EE",
    border: "1px solid #2A2F38",
    borderRadius: 6,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: state === "disabled" ? "default" : "pointer",
  };
}
