import React from "react";

const KNOWN_WORKING_CANDIDATE = {
  match: "Egypt vs Iran",
  seq: 1141,
  statKey: 1002,
};

export default function ClaimPanel({
  onCheckProof,
  isLoading,
  errorMsg,
}: {
  onCheckProof: () => void;
  isLoading: boolean;
  errorMsg: string | null;
}) {
  return (
    <div style={panelStyle}>
      <div style={eyebrowStyle}>THE DISPUTED CLAIM</div>

      <div style={{ marginBottom: 18 }}>
        <div style={fieldLabelStyle}>Fixture</div>
        <div style={fieldValueStyle}>{KNOWN_WORKING_CANDIDATE.match}</div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabelStyle}>Claim</div>
        <div style={fieldValueStyle}>
          statKey {KNOWN_WORKING_CANDIDATE.statKey} at seq {KNOWN_WORKING_CANDIDATE.seq}
        </div>
      </div>

      <h2 style={questionStyle}>Did this disputed stat condition verify?</h2>

      <button onClick={onCheckProof} disabled={isLoading} style={buttonStyle(isLoading)}>
        {isLoading ? "Checking the proof…" : "Check the proof"}
      </button>

      {errorMsg && (
        <div style={{ color: "#E0A04A", fontSize: 13, marginTop: 10 }}>
          Request failed: {errorMsg}
        </div>
      )}

      <div style={safetyLineStyle}>
        Read-only check. No wallet, no gas, no transaction broadcast.
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "#161A20",
  border: "1px solid #2A2F38",
  borderRadius: 8,
  padding: 24,
  height: "100%",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.1em",
  color: "#7A828E",
  marginBottom: 18,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.06em",
  color: "#7A828E",
  marginBottom: 4,
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#E8EAED",
};

const questionStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#E8EAED",
  margin: "0 0 20px 0",
  lineHeight: 1.4,
};

function buttonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "#2A2F38" : "#3D6BFF",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
  };
}

const safetyLineStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#5A6472",
  marginTop: 16,
  lineHeight: 1.5,
};
