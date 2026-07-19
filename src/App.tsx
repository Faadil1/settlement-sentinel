import { useState } from "react";
import PipelineTracker from "./components/PipelineTracker";
import StatusBadge from "./components/StatusBadge";
import EvidenceDrawer from "./components/EvidenceDrawer";
import type { RunClaimResponse } from "./types";

const CLAIM = { fixtureId: 17588309, match: "Egypt vs Iran", seq: 1141, statKey: 1002 };
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export default function App() {
  const [result, setResult] = useState<RunClaimResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  async function handleRunClaim() {
    setIsLoading(true); setErrorMsg(null); setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/run-claim`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(CLAIM) });
      setResult(await res.json());
    } catch (e: any) { setErrorMsg(e?.message || "Request failed"); } finally { setIsLoading(false); }
  }
  return <main className={`instrument ${isLoading ? "is-running" : ""} ${result ? "has-result" : ""}`}>
    <div className="atmosphere" aria-hidden="true" /><div className="shell">
      <header className="masthead"><a className="identity" href="#top" aria-label="Settlement Sentinel home"><span className="identity-mark" aria-hidden="true"><i /><i /><i /></span><span>Settlement Sentinel</span></a><p>Live evidence for claims resolved through TxLINE.</p></header>
      <section className="hero" id="top" aria-labelledby="claim-title">
        <div className="claim-block"><div className="eyebrow"><span /> Live claim</div><h1 id="claim-title">Egypt <em>vs</em> Iran</h1>
          <dl className="claim-meta" aria-label="Claim identifiers"><div><dt>fixtureId</dt><dd>17588309</dd></div><div><dt>seq</dt><dd>1141</dd></div><div><dt>statKey</dt><dd>1002</dd></div></dl>
          <button className="verify-button" type="button" onClick={handleRunClaim} disabled={isLoading}><span>{isLoading ? "Verifying live claim" : "Verify Live Claim"}</span><svg viewBox="0 0 28 12" aria-hidden="true"><path d="M1 6h24M20 1l5 5-5 5" /></svg></button>
          <p className="simulation-note">Read-only Solana simulation</p>{errorMsg && <p className="request-error" role="alert">Request failed: {errorMsg}</p>}
        </div>
        <div className="verdict-region" aria-live="polite" aria-busy={isLoading}><div className="current-lines" aria-hidden="true"><svg viewBox="0 0 700 360" preserveAspectRatio="none"><path className="current current-a" d="M-30 94C105 68 148 166 278 151S463 52 730 82" /><path className="current current-b" d="M-30 126C119 105 173 207 306 183S481 87 730 115" /><path className="current current-c" d="M-30 158C108 150 202 232 338 204S514 129 730 143" /></svg></div><StatusBadge status={result?.finalStatus ?? null} isLoading={isLoading} statement={result?.truthfulProofStatement} /></div>
      </section>
      <section className="proof-section" aria-labelledby="proof-heading"><div className="section-intro"><p className="eyebrow">Proof journey</p><h2 id="proof-heading">Truth emerges through evidence.</h2></div><PipelineTracker steps={result?.steps ?? []} isLoading={isLoading} /></section>
      <EvidenceDrawer result={result} />
      <footer><span>Settlement Sentinel</span><p>No escrow, wagering, or fund movement occurs anywhere in this product. validate_stat is called as a read-only simulated check only — never a broadcast transaction. This instrument requires no wallet connection and no gas from anyone viewing it.</p></footer>
    </div>
  </main>;
}
