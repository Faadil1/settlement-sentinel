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
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Manila Folder Tab */}
      <div style={folderTabStyle}>CASE FILE</div>
      
      <div style={caseBriefBodyStyle}>
        <div style={eyebrowStyle}>THE DISPUTED CLAIM</div>

        <div style={{ marginBottom: 16 }}>
          <div style={fieldLabelStyle}>Fixture</div>
          <div style={fieldValueStyle}>{KNOWN_WORKING_CANDIDATE.match}</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={fieldLabelStyle}>Disputed Stat</div>
          <div style={fieldValueStyle}>
            statKey {KNOWN_WORKING_CANDIDATE.statKey} at seq {KNOWN_WORKING_CANDIDATE.seq}
          </div>
        </div>

        <h2 style={questionStyle}>Did this disputed stat condition verify?</h2>

        <button onClick={onCheckProof} disabled={isLoading} style={buttonStyle(isLoading)}>
          {isLoading ? "Checking the proof…" : "Check the proof"}
        </button>

        {errorMsg && (
          <div style={{ color: "#8E3D2A", fontSize: 13, marginTop: 10, lineHeight: 1.4, fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        <div style={safetyLineStyle}>
          Read-only check. No wallet, no gas, no transaction broadcast.
        </div>
      </div>
    </div>
  );
}

const folderTabStyle: React.CSSProperties = {
  display: "inline-block",
  alignSelf: "flex-start",
  background: "#E5DCCB",
  color: "#4A4035",
  padding: "5px 14px",
  borderRadius: "5px 5px 0 0",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.12em",
  borderBottom: "none",
};

const caseBriefBodyStyle: React.CSSProperties = {
  background: "#E5DCCB",
  borderRadius: "0 6px 6px 6px",
  padding: 20,
  color: "#2C251C",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.14em",
  color: "#B8862D",
  marginBottom: 16,
  fontWeight: 700,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.06em",
  color: "#7A7062",
  marginBottom: 3,
  textTransform: "uppercase" as const,
  fontWeight: 600,
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#2C251C",
};

const questionStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: "#2C251C",
  margin: "0 0 16px 0",
  lineHeight: 1.4,
};

function buttonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "#C5BCA9" : "#3D6B3D",
    color: disabled ? "#7A7062" : "#F5F1E8",
    border: "none",
    borderRadius: 4,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled ? "default" : "pointer",
    letterSpacing: "0.02em",
    boxShadow: disabled ? "none" : "0 2px 4px rgba(0, 0, 0, 0.1)",
  };
}

const safetyLineStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#6B5E4E",
  marginTop: 14,
  lineHeight: 1.4,
};
