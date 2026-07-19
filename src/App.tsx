import React, { useState } from "react";
import ClaimPanel from "./components/ClaimPanel";
import ProofPanel from "./components/ProofPanel";
import JudgeModePanel from "./components/JudgeModePanel";
import type { RunClaimResponse } from "./types";

const KNOWN_WORKING_CANDIDATE = {
  fixtureId: 17588309,
  match: "Egypt vs Iran",
  seq: 1141,
  statKey: 1002,
};

export default function App() {
  const [result, setResult] = useState<RunClaimResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  async function handleRunClaim() {
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setIsUnavailable(false);
    try {
      const res = await fetch("/api/run-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(KNOWN_WORKING_CANDIDATE),
      });
      if (!res.ok) {
        throw new Error("API check failed");
      }
      const data: RunClaimResponse = await res.json();
      setResult(data);
    } catch (e: any) {
      setIsUnavailable(true);
      setErrorMsg("Proof check unavailable in this local preview. Run the API server or use the deployed Cloud Run demo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#262422",
        color: "#C8C2B6",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Top Header Registry Bar */}
      <div style={topBarStyle}>
        <span>MATCH RULING DESK</span>
        <span style={{ color: "#524E48" }}>·</span>
        <span>PROOF DOCKET NO. {KNOWN_WORKING_CANDIDATE.fixtureId}</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 64px" }}>
        <header style={{ marginBottom: 32, borderBottom: "1px solid rgba(200, 194, 182, 0.08)", paddingBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1.3, color: "#D8D0C4" }}>
            Turn a disputed World Cup claim into a TxLINE-backed verdict receipt.
          </h1>
        </header>

        <style>{responsiveStyleTag}</style>

        <div className="settlement-sentinel-split" style={splitScreenStyle}>
          <ClaimPanel onCheckProof={handleRunClaim} isLoading={isLoading} errorMsg={errorMsg} />
          <ProofPanel result={result} isLoading={isLoading} isUnavailable={isUnavailable} />
        </div>

        <div style={{ marginTop: 24 }}>
          <JudgeModePanel />
        </div>

        <footer style={{ marginTop: 40, fontSize: 11, color: "#524E48", lineHeight: 1.6 }}>
          Read-only proof verification. No wallet, no gas, no transaction broadcast.
        </footer>
      </div>
    </div>
  );
}

const topBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 24px",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.14em",
  color: "#7A756A",
  borderBottom: "1px solid rgba(200, 194, 182, 0.08)",
  background: "#1E1C1B",
};

const splitScreenStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(260px, 340px) 1fr",
  gap: 24,
  alignItems: "start",
};

const responsiveStyleTag = `
  @media (max-width: 720px) {
    .settlement-sentinel-split {
      grid-template-columns: 1fr !important;
    }
  }
`;
