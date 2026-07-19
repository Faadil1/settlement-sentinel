import type { RunClaimResponse } from "../types";
export default function EvidenceDrawer({ result }: { result: RunClaimResponse | null }) {
  if (!result) return null;
  const finalStep = result.steps.find((step) => step.id === "final_validation");
  return <section className="evidence-section" aria-labelledby="evidence-heading"><div className="evidence-heading"><p className="eyebrow">Technical evidence</p><h2 id="evidence-heading">Inspect the record</h2></div>
    <details className="evidence-disclosure"><summary><span>Validation record</span><small>Claim, source and payload</small></summary><div className="evidence-content evidence-grid"><div><span>Fixture</span><strong>{result.fixture ? `${result.fixture.participant1} vs ${result.fixture.participant2} · ${result.fixture.fixtureId}` : "Not found"}</strong></div><div><span>Evidence</span><strong>{result.evidence.primaryLabel} / {result.evidence.claimStrength} / {result.evidence.sourceConfidence}</strong></div><div className="wide"><span>Proof payload fields retrieved</span><code>{result.proofPayloadFields.join(", ") || "None"}</code></div></div></details>
    <details className="evidence-disclosure"><summary><span>Program evidence</span><small>Root resolution and simulation logs</small></summary><div className="evidence-content">{result.finalStatus === "VERIFIED" && <><p>The TxLINE program resolved a valid root for the validation interval.</p><p>No standalone root identifier was emitted in the simulation logs.</p></>}{finalStep?.error && <pre className="error-log">{finalStep.error}</pre>}{result.validationSimulationLogs.length > 0 && <pre>{result.validationSimulationLogs.join("\n")}</pre>}</div></details>
  </section>;
}
