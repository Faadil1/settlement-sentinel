import React, { useState } from "react";
import PipelineTracker from "./components/PipelineTracker";
import StatusBadge from "./components/StatusBadge";
import EvidenceDrawer from "./components/EvidenceDrawer";
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
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#7A828E", marginBottom: 6 }}>
            SETTLEMENT SENTINEL
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            World Cup market resolution cockpit
          </h1>
          <p style={{ fontSize: 15, color: "#A8AFB8", marginTop: 8, lineHeight: 1.6 }}>
            Submits a disputed stat claim and runs it live through TxLINE's
            devnet API and Solana program. Every stage below is real — this
            page never fabricates a result it has not actually attempted.
          </p>
        </header>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#A8AFB8", marginBottom: 10 }}>
            Claim under test: <strong style={{ color: "#E8EAED" }}>{KNOWN_WORKING_CANDIDATE.match}</strong>{" "}
            — stat {KNOWN_WORKING_CANDIDATE.statKey}, sequence {KNOWN_WORKING_CANDIDATE.seq}
          </div>
          <button onClick={handleRunClaim} disabled={isLoading} style={buttonStyle(isLoading)}>
            {isLoading ? "Running pipeline…" : "Run claim through TxLINE"}
          </button>
          {errorMsg && (
            <div style={{ color: "#E0A04A", fontSize: 13, marginTop: 10 }}>
              Request failed: {errorMsg}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <section style={panelStyle}>
            <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#7A828E", marginBottom: 14 }}>
              PIPELINE
            </div>
            <PipelineTracker steps={result?.steps ?? []} isLoading={isLoading} />
          </section>

          {result && <StatusBadge status={result.finalStatus} />}

          <EvidenceDrawer result={result} />
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

const panelStyle: React.CSSProperties = {
  background: "#161A20",
  border: "1px solid #2A2F38",
  borderRadius: 8,
  padding: 20,
};
