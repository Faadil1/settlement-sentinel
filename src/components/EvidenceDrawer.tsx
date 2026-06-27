import React from "react";
import type { RunClaimResponse } from "../types";

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

  return (
    <div style={panelStyle}>
      <div style={headingStyle}>EVIDENCE</div>

      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Truthful proof statement</div>
        <div style={{ fontSize: 14, color: "#E8EAED", lineHeight: 1.5 }}>{result.truthfulProofStatement}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Evidence label / claim strength / source confidence</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#CBD9EE" }}>
          {result.evidence.primaryLabel} / {result.evidence.claimStrength} / {result.evidence.sourceConfidence}
        </div>
      </div>

      {result.fixture && (
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Fixture</div>
          <div style={{ fontSize: 14, color: "#E8EAED" }}>
            {result.fixture.participant1} vs {result.fixture.participant2} (FixtureId {result.fixture.fixtureId})
          </div>
        </div>
      )}

      {result.proofPayloadFields.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Proof payload fields retrieved</div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#A8AFB8" }}>
            {result.proofPayloadFields.join(", ")}
          </div>
        </div>
      )}

      {finalStep?.error && (
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Validation error (verbatim)</div>
          <pre style={preStyle}>{finalStep.error}</pre>
        </div>
      )}

      {result.validationSimulationLogs.length > 0 && (
        <div>
          <div style={labelStyle}>Program logs (verbatim)</div>
          <pre style={preStyle}>{result.validationSimulationLogs.join("\n")}</pre>
        </div>
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
