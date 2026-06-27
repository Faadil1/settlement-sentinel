# Settlement Sentinel

> **TL;DR** — Settlement Sentinel verifies a World Cup stat claim against TxLINE's deployed Solana program via read-only Merkle proof simulation. It is not a betting product — no escrow, wagering, or fund movement occurs anywhere. The proof pipeline runs live in front of you and reports honestly.

---

## What This Is

A verifiable sports-data proof cockpit. Submits a disputed stat claim and
runs it live through TxLINE's devnet API and Solana program, showing every
pipeline stage honestly — including when the final proof check does not pass.

**This is not a betting product.** No escrow, wagering, or fund movement
occurs anywhere in this codebase. `validate_stat` is called as a read-only
simulated check only — never a broadcast transaction.

## How It Works

1. **Authenticate** — obtain a guest JWT from TxLINE and activate an API token
2. **Load fixture** — fetch the World Cup match fixture from TxLINE
3. **Score snapshot** — retrieve the current score data for the fixture
4. **Proof payload** — request the stat-validation payload (Merkle proofs, roots, summaries)
5. **On-chain simulation** — submit `validate_stat` to TxLINE's deployed Solana program via read-only `simulateTransaction`
6. **Verify** — check the program's return value: `true` = Merkle proof validated against the on-chain root

## Architecture

```
┌──────────────┐     ┌───────────────┐     ┌────────────────────┐     ┌───────────────────────────────────┐
│  Browser UI  │────▶│  Express API  │────▶│ TxLINE Devnet API  │────▶│ Solana Program (read-only         │
│  (React)     │◀────│  (Node.js)    │◀────│ (auth, fixtures,   │◀────│  simulation via simulateTransaction│
│              │     │               │     │  scores, proofs)   │     │  on devnet)                       │
└──────────────┘     └───────────────┘     └────────────────────┘     └───────────────────────────────────┘
```

## Current Evidence Status: VERIFIED ✓

Live-demonstrated against TxLINE devnet (local and Cloud Run):

| Stage | Status |
|---|---|
| TxLINE devnet API reachable | ✓ |
| Solana devnet RPC reachable | ✓ |
| Throwaway devnet wallet funded | ✓ |
| TxLINE guest JWT issuance | ✓ |
| Free-tier devnet `subscribe` (on-chain, 0 TxL cost) | ✓ |
| API token activation | ✓ |
| Fixtures snapshot | ✓ |
| Score snapshot | ✓ |
| Stat-validation payload retrieval | ✓ |
| `validate_stat` reaches deployed devnet program | ✓ |
| Program finds valid on-chain root for interval | ✓ |
| **Merkle proof validated — predicate returned `true`** | **✓** |

**Known verified claim:** fixtureId `17588309` (Egypt vs Iran), seq `1141`, statKey `1002`.

Truthful proof statement used throughout this product:

> "TxLINE Merkle proof validated against the on-chain program/root."

## TxLINE Endpoints Used

- `POST /auth/guest/start`
- `POST /api/token/activate`
- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/scores/stat-validation`
- On-chain program `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`
  (devnet), instructions `subscribe` and `validate_stat`

## Feedback on the TxLINE API Experience

- The Program Addresses devnet API host (`txline-dev.txodds.com`)
  differs from a host mentioned elsewhere in prose
  (`oracle-dev.txodds.com`), which does not resolve. This caused early
  confusion.
- Everything else — auth, free-tier subscribe, and the data endpoints —
  worked exactly as documented.

## Run Locally

```bash
npm install
npm run dev:server   # Express API on :8080
npm run dev:client   # Vite dev server on :5173, proxies /api to :8080
```

On first run, a throwaway devnet keypair is generated at
`./throwaway-devnet-keypair.json` (gitignored). Fund it with devnet SOL
via `solana airdrop 1 <printed-pubkey> --url devnet` if the in-process
airdrop is rate-limited.

## Build and Run as One Process (mirrors Cloud Run)

```bash
npm run build
npm start
```

## Required Environment Variables for Deployment

- `TXLINE_API_HOST` — defaults to `https://txline-dev.txodds.com`
- `TXLINE_API_TOKEN` — optional; skips the on-chain subscribe step if set
- `DEVNET_KEYPAIR_JSON` — JSON array of the secret key bytes; required
  on Cloud Run since there is no writable local keypair file there

No secrets are committed to this repository.
