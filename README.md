# Settlement Sentinel

A verifiable World Cup market resolution cockpit. Submits a disputed stat
claim and runs it live through TxLINE's devnet API and Solana program,
showing every pipeline stage honestly — including when the final proof
check does not pass.

This is not a betting product. No escrow, wagering, or fund movement
occurs anywhere in this codebase. `validate_stat` is called as a
read-only simulated check only — never a broadcast transaction.

## Current evidence status (PARTIAL+)

Live-demonstrated in Google Cloud Shell against TxLINE devnet:

- TxLINE devnet API reachable
- Solana devnet RPC reachable
- Throwaway devnet wallet funded and working
- TxLINE guest JWT issuance
- Free-tier devnet `subscribe` (on-chain, 0 TxL cost)
- API token activation
- Fixtures snapshot
- Score snapshot
- Stat-validation payload retrieval
- `validate_stat` reaches the deployed devnet program (Instruction:
  ValidateStat logged)
- Program finds a valid on-chain root for the relevant interval

**Currently failing:** the final proof check returns Anchor custom error
`6004 InvalidMainTreeProof` ("The summary does not belong to the
on-chain root"). We have an open inquiry with TxLINE support requesting
a known-good `validate_stat` example; root cause is not yet confirmed.

Truthful proof statement used throughout this product:

> "TxLINE proof payload retrieved and validated up to the deployed
> Solana program/root check."

This becomes "TxLINE Merkle proof validated against the on-chain
program/root." only if `validate_stat` returns `true` in a future run.

## TxLINE endpoints used

- `POST /auth/guest/start`
- `POST /api/token/activate`
- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/scores/stat-validation`
- On-chain program `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`
  (devnet), instructions `subscribe` and `validate_stat`

Known working test candidate: fixtureId `17588309` (Egypt vs Iran),
seq `1141`, statKey `1002`.

## Feedback on the TxLINE API experience

- The on-chain validation example in the docs (`validate_stat` via
  `.view()`) does not currently produce a passing result against a
  real World Cup fixture for us; we could not find a versioned API
  reference page for the `stat-validation` endpoint, only an inline
  prose example.
- The Program Addresses devnet API host (`txline-dev.txodds.com`)
  differs from a host mentioned elsewhere in prose
  (`oracle-dev.txodds.com`), which does not resolve. This caused early
  confusion.
- Everything else — auth, free-tier subscribe, and the data endpoints —
  worked exactly as documented.

## Run locally

```bash
npm install
npm run dev:server   # Express API on :8080
npm run dev:client   # Vite dev server on :5173, proxies /api to :8080
```

On first run, a throwaway devnet keypair is generated at
`./throwaway-devnet-keypair.json` (gitignored). Fund it with devnet SOL
via `solana airdrop 1 <printed-pubkey> --url devnet` if the in-process
airdrop is rate-limited.

## Build and run as one process (mirrors Cloud Run)

```bash
npm run build
npm start
```

## Required environment variables for deployment

- `TXLINE_API_HOST` — defaults to `https://txline-dev.txodds.com`
- `TXLINE_API_TOKEN` — optional; skips the on-chain subscribe step if set
- `DEVNET_KEYPAIR_JSON` — JSON array of the secret key bytes; required
  on Cloud Run since there is no writable local keypair file there

No secrets are committed to this repository.
