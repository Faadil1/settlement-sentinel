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
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "32px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* ─── Hero ─── */}
        <header style={{ marginBottom: 36, borderBottom: "1px solid #1E2530", paddingBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "#5A6472", marginBottom: 8, fontWeight: 500 }}>
            SETTLEMENT SENTINEL
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            Verifiable sports-data proofs on Solana — powered by TxLINE
          </h1>
          <p style={{ fontSize: 14, color: "#A8AFB8", marginTop: 10, lineHeight: 1.65, maxWidth: 720 }}>
            Settlement Sentinel submits a real World Cup stat claim to TxLINE and validates
            the returned Merkle proof against TxLINE's deployed Solana program/root via
            read-only simulation. No betting, no escrow, no transaction broadcast — just
            transparent proof verification.
          </p>

          {/* Chip badges */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {["Solana Devnet", "TxLINE Oracle", "Live Merkle Proof"].map((chip) => (
              <span
                key={chip}
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  background: "rgba(61, 107, 255, 0.1)",
                  border: "1px solid rgba(61, 107, 255, 0.25)",
                  color: "#7BA3FF",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </header>

        {/* ─── Claim Launcher ─── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: "#A8AFB8", marginBottom: 10 }}>
            Claim under test: <strong style={{ color: "#E8EAED" }}>{KNOWN_WORKING_CANDIDATE.match}</strong>{" "}
            — stat {KNOWN_WORKING_CANDIDATE.statKey}, sequence {KNOWN_WORKING_CANDIDATE.seq}
          </div>
          <button onClick={handleRunClaim} disabled={isLoading} style={buttonStyle(isLoading)}>
            {isLoading ? "Running pipeline…" : "Run TxLINE Proof Check"}
          </button>
          {errorMsg && (
            <div style={{ color: "#E0A04A", fontSize: 13, marginTop: 10 }}>
              Request failed: {errorMsg}
            </div>
          )}
        </div>

        {/* ─── Proof Cockpit ─── */}
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#3D6BFF", marginBottom: 14, fontWeight: 600 }}>
            ✦ PROOF COCKPIT
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {/* Status badge first — the outcome is the first thing a judge sees */}
            {result && <StatusBadge status={result.finalStatus} />}

            <section style={panelStyle}>
              <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#7A828E", marginBottom: 14 }}>
                PIPELINE
              </div>
              <PipelineTracker steps={result?.steps ?? []} isLoading={isLoading} />
            </section>

            <EvidenceDrawer result={result} />
          </div>
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
    background: disabled ? "#2A2F38" : "linear-gradient(135deg, #3D6BFF, #2851CC)",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "11px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
    transition: "background 0.2s ease, box-shadow 0.2s ease",
    boxShadow: disabled ? "none" : "0 2px 12px rgba(61, 107, 255, 0.25)",
  };
}

const panelStyle: React.CSSProperties = {
  background: "#161A20",
  border: "1px solid #2A2F38",
  borderRadius: 8,
  padding: 20,
};
