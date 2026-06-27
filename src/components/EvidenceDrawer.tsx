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

export default function EvidenceDrawer({ result }: { result: RunClaimResponse | null }) {
  if (!result) {
    return (
      <div style={panelStyle}>
        <div style={headingStyle}>EVIDENCE</div>
        <div style={{ color: "#7A828E", fontSize: 13 }}>Run a claim to see raw evidence here.</div>
      </div>
    );
  }

  const finalStep = result.steps.find((s) => s.id === "final_validation");
  const keyLogLines = result.validationSimulationLogs.filter(isKeyLogLine);
  const allLogs = result.validationSimulationLogs;

  return (
    <div style={panelStyle}>
      <div style={headingStyle}>EVIDENCE</div>

      {/* Truthful proof statement — visually anchored */}
      <div
        style={{
          marginBottom: 20,
          borderLeft: "3px solid #3D9970",
          paddingLeft: 14,
        }}
      >
        <div style={labelStyle}>Truthful proof statement</div>
        <div style={{ fontSize: 15, color: "#E8EAED", lineHeight: 1.55, fontWeight: 500 }}>
          {result.truthfulProofStatement}
        </div>
      </div>

      {/* Metadata grid — 2 columns for scannability */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px 24px",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={labelStyle}>Evidence label</div>
          <div style={monoValueStyle}>{result.evidence.primaryLabel}</div>
        </div>
        <div>
          <div style={labelStyle}>Claim strength</div>
          <div style={monoValueStyle}>{result.evidence.claimStrength}</div>
        </div>
        <div>
          <div style={labelStyle}>Source confidence</div>
          <div style={monoValueStyle}>{result.evidence.sourceConfidence}</div>
        </div>
        {result.fixture && (
          <div>
            <div style={labelStyle}>Fixture</div>
            <div style={{ fontSize: 14, color: "#E8EAED" }}>
              {result.fixture.participant1} vs {result.fixture.participant2}
              <span style={{ color: "#7A828E", fontSize: 12, marginLeft: 6 }}>
                ID {result.fixture.fixtureId}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Proof payload fields as chips */}
      {result.proofPayloadFields.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Proof payload fields retrieved</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {result.proofPayloadFields.map((f) => (
              <span
                key={f}
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontFamily: "ui-monospace, monospace",
                  background: "#1E2530",
                  border: "1px solid #2A2F38",
                  color: "#A8AFB8",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key proof log lines — always visible */}
      {keyLogLines.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Key proof log lines</div>
          <pre style={{ ...preStyle, borderLeft: "3px solid #3D9970" }}>
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
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Validation error (verbatim)</div>
          <pre style={preStyle}>{finalStep.error}</pre>
        </div>
      )}

      {/* Full program logs — collapsed by default */}
      {allLogs.length > 0 && (
        <details style={{ marginBottom: 0 }}>
          <summary
            style={{
              cursor: "pointer",
              fontSize: 12,
              letterSpacing: "0.06em",
              color: "#7A828E",
              marginBottom: 8,
              userSelect: "none",
            }}
          >
            Full program logs ({allLogs.length} lines)
          </summary>
          <pre style={preStyle}>{allLogs.join("\n")}</pre>
        </details>
      )}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "#161A20",
  border: "1px solid #2A2F38",
  borderRadius: 8,
  padding: 20,
};

const headingStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.1em",
  color: "#7A828E",
  marginBottom: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.06em",
  color: "#7A828E",
  marginBottom: 4,
  textTransform: "uppercase" as const,
};

const monoValueStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontSize: 13,
  color: "#CBD9EE",
  fontWeight: 600,
};

const preStyle: React.CSSProperties = {
  background: "#0D0F13",
  border: "1px solid #2A2F38",
  borderRadius: 6,
  padding: 12,
  fontSize: 12,
  color: "#A8D8B0",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0,
};
