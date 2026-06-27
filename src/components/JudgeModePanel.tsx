import React from "react";

const COLUMNS = [
  {
    heading: "What is real",
    body: "A live TxLINE proof check against the deployed Solana program/root.",
  },
  {
    heading: "What is not claimed",
    body: "No betting, no escrow, no funds moved, no transaction broadcast, no guessed stat meaning.",
  },
  {
    heading: "What would fail",
    body: "If the Merkle proof or on-chain root did not validate, the verdict would not return VERIFIED.",
  },
];

export default function JudgeModePanel() {
  return (
    <div style={panelStyle}>
      <div style={eyebrowStyle}>JUDGE MODE</div>
      <div style={gridStyle}>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <div style={headingStyle}>{col.heading}</div>
            <div style={bodyStyle}>{col.body}</div>
          </div>
        ))}
      </div>
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
  marginBottom: 16,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
};

const headingStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#E8EAED",
  marginBottom: 6,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#A8AFB8",
  lineHeight: 1.6,
};
