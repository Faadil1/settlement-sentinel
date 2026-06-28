import React from "react";

const COLUMNS = [
  {
    heading: "What is real",
    body: "A live TxLINE proof check against the deployed Solana program/root via read-only simulation.",
  },
  {
    heading: "What is not claimed",
    body: "No betting, no escrow, no funds moved, no transaction broadcast, no guessed football stat meaning.",
  },
  {
    heading: "What would fail",
    body: "If the Merkle proof or on-chain root did not validate, the receipt status would not return VERIFIED.",
  },
];

export default function JudgeModePanel() {
  return (
    <div style={stripStyle}>
      <div style={eyebrowStyle}>PROOF DOCKET TRUST APPENDIX</div>
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

const stripStyle: React.CSSProperties = {
  borderTop: "1px solid rgba(200, 194, 182, 0.08)",
  paddingTop: 18,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.14em",
  color: "#B8862D",
  marginBottom: 14,
  fontWeight: 700,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
};

const headingStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#C8C2B6",
  marginBottom: 4,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#7A756A",
  lineHeight: 1.5,
};
