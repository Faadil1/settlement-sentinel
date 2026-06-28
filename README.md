# Settlement Sentinel

Settlement Sentinel turns a disputed World Cup stat condition into a TxLINE-backed verdict receipt by validating a Merkle proof against TxLINE’s deployed Solana program/root via read-only simulation.

It is designed for prediction-market settlement review, trading-agent safety checks, and fan-facing disputed-claim experiences where the important question is simple:

> Can this stat condition be verified against the TxLINE proof path before anyone trusts it?

---

## What it does

Settlement Sentinel takes a disputed match-stat claim and runs it through a proof-checking workflow:

1. Selects a known World Cup stat condition.
2. Retrieves the relevant TxLINE proof payload.
3. Simulates validation against TxLINE’s deployed Solana program/root.
4. Produces a verdict receipt showing whether the claim is verified.
5. Exposes the proof path, program logs, and limitations in a judge-readable interface.

The current demo claim is:

* Match: Egypt vs Iran
* Fixture ID: `17588309`
* Sequence: `1141`
* Stat key: `1002`
* Final verdict: `VERIFIED`

The exact proof statement used by the app is:

> TxLINE Merkle proof validated against the on-chain program/root.

---

## Why it matters

Prediction markets and automated settlement tools need more than a nice dashboard. They need a way to show why a condition should be trusted.

Settlement Sentinel focuses on the moment before a market, agent, or operator accepts a disputed result. Instead of asking the user to trust a UI label, it creates a structured verdict receipt backed by TxLINE proof validation.

This makes the project useful as:

* a settlement-review cockpit for disputed stat conditions;
* a proof-safety layer for trading or settlement agents;
* a transparent fan-facing receipt for “why this claim was accepted”;
* a reusable verification pattern for future sports-data disputes.

---

## How it uses TxLINE

Settlement Sentinel uses TxLINE as the source of the proof path.

The backend calls the TxLINE developer API, retrieves a stat-validation payload, and validates that payload against TxLINE’s deployed Solana devnet program/root through read-only simulation.

The proof flow includes:

* TxLINE API proof payload retrieval;
* Merkle proof fields including `statProof`, `subTreeProof`, and `mainTreeProof`;
* Solana program execution logs from the deployed TxLINE program;
* final `validate_stat returned true` result;
* a structured verdict receipt generated from the proof result.

The app does not simply display static sports data. It uses TxLINE’s proof infrastructure to determine whether the selected condition can be verified.

---

## Verified live proof

The final Cloud Run proof run returned:

* `finalStatus: VERIFIED`
* `fixtureId: 17588309`
* `participant1: Egypt`
* `participant2: Iran`
* `validate_stat returned true`
* `Program ... success`
* `truthfulProofStatement: TxLINE Merkle proof validated against the on-chain program/root.`

Because the current TxLINE fixture snapshot no longer lists the historical fixture label, the app locks the case-file metadata for the known verified claim instead of falling back to an unrelated fixture. This prevents incorrect fixture substitution while still allowing the TxLINE proof validation to run.

In the receipt:

* fixture metadata is marked as `PARTIAL / DESCRIBED` when it comes from locked case-file metadata;
* proof payload retrieval, program execution, on-chain root discovery, and final validation remain `LIVE`;
* the final claim strength remains `VERIFIED` only when the TxLINE proof path validates successfully.

---

## Demo flow

1. Open the deployed Settlement Sentinel app.
2. Review the case file for the disputed World Cup stat condition.
3. Click **Check the proof**.
4. The app runs the TxLINE proof validation workflow.
5. The verdict receipt updates from `PENDING` to `VERIFIED`.
6. Open the evidence drawer to inspect the proof stages and Solana program logs.

The interface is intentionally structured like a proof docket:

* left side: disputed claim / case file;
* right side: verdict receipt;
* lower section: proof timeline and audit evidence;
* appendix: what is real, what is not claimed, and what would fail.

---

## Architecture

Settlement Sentinel is a full-stack TypeScript app.

### Frontend

* React
* Vite
* TypeScript
* proof-docket UI
* verdict receipt state handling
* collapsed evidence and timeline drawers

### Backend

* Node.js
* Express
* TypeScript
* TxLINE API integration
* Solana devnet validation simulation
* structured proof-result generation

### Deployment

* Google Cloud Run
* Dockerfile-based deployment
* TxLINE API token and devnet keypair provided through Cloud Run secrets

---

## API

### Health check

```bash
GET /api/health
```

### Run claim verification

```bash
POST /api/run-claim
Content-Type: application/json

{
  "fixtureId": 17588309,
  "seq": 1141,
  "statKey": 1002
}
```

Example response fields:

```json
{
  "finalStatus": "VERIFIED",
  "truthfulProofStatement": "TxLINE Merkle proof validated against the on-chain program/root.",
  "evidence": {
    "primaryLabel": "LIVE",
    "claimStrength": "VERIFIED",
    "sourceConfidence": "CONFIRMED"
  }
}
```

---

## Evidence

The repository includes evidence files showing successful local and Cloud Run verification runs.

Key final evidence file:

```text
evidence/cloud-run-fixture-consistency-verified.json
```

This file is the final post-UI, post-fixture-consistency verification artifact.

It confirms that the final deployed version returns a coherent verified result for the known claim and no longer falls back to an unrelated fixture.

---

## What is not claimed

Settlement Sentinel is intentionally narrow and does not overclaim.

It does not:

* place bets;
* move funds;
* settle a market on-chain;
* broadcast a transaction;
* custody assets;
* act as an oracle network;
* decide legal disputes;
* claim semantic meaning for `statKey 1002` beyond the verified TxLINE stat condition;
* claim that all possible World Cup stat conditions are supported.

The current implementation demonstrates a verified proof path for one known stat condition.

---

## Failure behavior

The app is designed to fail honestly.

If the local API server is unavailable, the UI shows:

```text
UNAVAILABLE
Proof check unavailable in this local preview.
Run the API server or use the deployed Cloud Run demo.
```

If the proof cannot be validated, the receipt does not show `VERIFIED`.

If the fixture snapshot no longer contains the historical fixture label, the app does not fall back to the first fixture in the snapshot. Instead, it uses locked case-file metadata and clearly marks that metadata as partial/described while keeping proof validation separate.

---

## Run locally

Install dependencies:

```bash
npm install
```

Run the client and server in separate terminals:

```bash
npm run dev:client
```

```bash
npm run dev:server
```

Build production assets:

```bash
npm run build
```

---

## Required environment variables

```bash
TXLINE_API_HOST=https://txline-dev.txodds.com
TXLINE_API_TOKEN=<your_txline_api_token>
DEVNET_KEYPAIR_JSON=<your_devnet_keypair_json>
```

---

## Deploy to Cloud Run

```bash
gcloud run deploy settlement-sentinel \
  --source . \
  --region northamerica-northeast1 \
  --allow-unauthenticated \
  --set-env-vars TXLINE_API_HOST=https://txline-dev.txodds.com \
  --set-secrets TXLINE_API_TOKEN=txline-api-token:latest,DEVNET_KEYPAIR_JSON=devnet-keypair-json:latest
```

---

## Final verification command

```bash
SERVICE_URL=$(gcloud run services describe settlement-sentinel \
  --region northamerica-northeast1 \
  --format="value(status.url)")

curl --max-time 120 -sS -X POST "$SERVICE_URL/api/run-claim" \
  -H "Content-Type: application/json" \
  -d '{"fixtureId":17588309,"seq":1141,"statKey":1002}' \
  | tee evidence/cloud-run-fixture-consistency-verified.json
```

Expected result:

```text
finalStatus: VERIFIED
fixtureId: 17588309
Egypt vs Iran
validate_stat returned true
Program ... success
```

---

## Project status

Current status:

```text
FUNCTIONAL FREEZE + UI FREEZE
```

Final verified branch:

```text
polish/demo-ready
```

Final evidence file:

```text
evidence/cloud-run-fixture-consistency-verified.json
```

The project is ready for README review, demo recording, and final hackathon submission packaging.
