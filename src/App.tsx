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

  async function handleRunClaim() {
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    try {
      const res = await fetch("/api/run-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(KNOWN_WORKING_CANDIDATE),
      });
      const data: RunClaimResponse = await res.json();
      setResult(data);
    } catch (e: any) {
      setErrorMsg(e?.message || "Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0F13",
        color: "#E8EAED",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "32px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#7A828E", marginBottom: 6 }}>
            SETTLEMENT SENTINEL
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            One disputed World Cup stat condition. One TxLINE proof path.
          </h1>
        </header>

        <style>{responsiveStyleTag}</style>

        <div className="settlement-sentinel-split" style={splitScreenStyle}>
          <ClaimPanel onCheckProof={handleRunClaim} isLoading={isLoading} errorMsg={errorMsg} />
          <ProofPanel result={result} isLoading={isLoading} />
        </div>

        <div style={{ marginTop: 20 }}>
          <JudgeModePanel />
        </div>

        <footer style={{ marginTop: 40, fontSize: 12, color: "#5A6472", lineHeight: 1.6 }}>
          No escrow, wagering, or fund movement occurs anywhere in this product.
          validate_stat is called as a read-only simulated check only — never
          a broadcast transaction. This cockpit requires no wallet connection
          and no gas from anyone viewing it.
        </footer>
      </div>
    </div>
  );
}

const splitScreenStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(280px, 380px) 1fr",
  gap: 20,
  alignItems: "start",
};

// Narrow viewports stack the split-screen into a single column. This
// is expressed via a media query injected through a <style> tag since
// inline styles cannot express @media rules directly.
const responsiveStyleTag = `
  @media (max-width: 720px) {
    .settlement-sentinel-split {
      grid-template-columns: 1fr !important;
    }
  }
`;
