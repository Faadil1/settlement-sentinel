import React from "react";
import type { RunClaimResponse } from "../types";

/** Key proof lines a judge should see at a glance — extracted from verbose logs. */
const KEY_LOG_PATTERNS = [
  "Instruction: ValidateStat",
  "SUCCESS: Account integrity verified",
  "SUCCESS: Found valid on-chain root",
  "Predicate evaluated to: true",
  "success",
];

function isKeyLogLine(line: string): boolean {
  return KEY_LOG_PATTERNS.some((p) => line.includes(p));
}

export default function EvidenceDrawer({
  result,
  isUnavailable,
}: {
  result: RunClaimResponse | null;
  isUnavailable?: boolean;
}) {
  if (isUnavailable) {
    return (
      <details style={auditSectionStyle}>
        <summary style={auditSummaryStyle}>AUDIT EVIDENCE</summary>
        <div style={{ paddingTop: 12, color: "#524E48", fontSize: 13 }}>
          Audit evidence unavailable (local preview).
        </div>
      </details>
    );
  }

  if (!result) {
    return (
      <details style={auditSectionStyle}>
        <summary style={auditSummaryStyle}>AUDIT EVIDENCE</summary>
        <div style={{ paddingTop: 12, color: "#524E48", fontSize: 13 }}>
          Run a proof check to view raw simulation evidence.
        </div>
      </details>
    );
  }

  const finalStep = result.steps.find((s) => s.id === "final_validation");
  const keyLogLines = result.validationSimulationLogs.filter(isKeyLogLine);
  const allLogs = result.validationSimulationLogs;

  return (
    <details style={auditSectionStyle}>
      <summary style={auditSummaryStyle}>
        AUDIT EVIDENCE ({result.proofPayloadFields.length} payload fields)
      </summary>
      <div style={{ paddingTop: 14 }}>

        {/* Truthful proof statement — visually anchored */}
        <div style={{ marginBottom: 16, borderLeft: "3px solid #3D6B3D", paddingLeft: 12 }}>
          <div style={labelStyle}>Truthful proof statement</div>
          <div style={{ fontSize: 13, color: "#C8C2B6", lineHeight: 1.5, fontWeight: 500 }}>
            {result.truthfulProofStatement}
          </div>
        </div>

        {/* Metadata — compact inline */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 20px", marginBottom: 16 }}>
          <div>
            <div style={labelStyle}>Evidence Label</div>
            <div style={metaValueStyle}>{result.evidence.primaryLabel}</div>
          </div>
          <div>
            <div style={labelStyle}>Claim Strength</div>
            <div style={metaValueStyle}>{result.evidence.claimStrength}</div>
          </div>
          <div>
            <div style={labelStyle}>Source Confidence</div>
            <div style={metaValueStyle}>{result.evidence.sourceConfidence}</div>
          </div>
        </div>

        {/* Proof payload fields — inline chips */}
        {result.proofPayloadFields.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Payload fields retrieved</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 3 }}>
              {result.proofPayloadFields.map((f) => (
                <span key={f} style={chipStyle}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Key proof log lines — always visible */}
        {keyLogLines.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Key proof logs</div>
            <pre style={{ ...preStyle, borderLeft: "3px solid #3D6B3D" }}>
              {keyLogLines.map((line, i) => (
                <React.Fragment key={i}>
                  {line.replace(/^Program log: /, "").trim()}
                  {i < keyLogLines.length - 1 ? "\n" : ""}
                </React.Fragment>
              ))}
            </pre>
          </div>
        )}

        {/* Validation error if present */}
        {finalStep?.error && (
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Validation error (verbatim)</div>
            <pre style={preStyle}>{finalStep.error}</pre>
          </div>
        )}

        {/* Full program logs — collapsed */}
        {allLogs.length > 0 && (
          <details>
            <summary style={{ cursor: "pointer", fontSize: 11, color: "#524E48", marginBottom: 6, userSelect: "none" }}>
              Full program logs ({allLogs.length} lines)
            </summary>
            <pre style={preStyle}>{allLogs.join("\n")}</pre>
          </details>
        )}
      </div>
    </details>
  );
}

const auditSectionStyle: React.CSSProperties = {
  borderTop: "1px solid rgba(200, 194, 182, 0.08)",
  paddingTop: 14,
};

const auditSummaryStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.12em",
  color: "#7A756A",
  fontWeight: 600,
  cursor: "pointer",
  outline: "none",
  userSelect: "none",
  textTransform: "uppercase",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.06em",
  color: "#524E48",
  marginBottom: 3,
  textTransform: "uppercase" as const,
  fontWeight: 600,
};

const metaValueStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontSize: 12,
  color: "#C8C2B6",
  fontWeight: 600,
};

const chipStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 3,
  fontSize: 11,
  fontFamily: "ui-monospace, monospace",
  background: "rgba(200, 194, 182, 0.04)",
  border: "1px solid rgba(200, 194, 182, 0.08)",
  color: "#7A756A",
};

const preStyle: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.12)",
  border: "1px solid rgba(200, 194, 182, 0.06)",
  borderRadius: 4,
  padding: 10,
  fontSize: 11,
  color: "#8A8072",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0,
};
