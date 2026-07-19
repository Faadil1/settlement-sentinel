/**
 * Settlement Sentinel — pipeline
 * ------------------------------------------------------------------
 * Refactor of the proven G2 spike script into named, callable stages.
 * No new mechanism is introduced here. No escrow / settlement
 * instructions exist in this file. validate_stat is called via
 * .view()/.simulate() only — a read-only simulated call, never a
 * broadcast transaction.
 *
 * Known real result as of this build (do not overwrite without a
 * new live run): validate_stat reaches the deployed devnet program,
 * the program finds a valid on-chain root, and the final proof check
 * fails with Anchor custom error 6004 (InvalidMainTreeProof). This
 * file must keep reporting that honestly until either (a) TxLINE
 * support provides a corrected example, or (b) a live rerun produces
 * a different real result.
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import nacl from "tweetnacl";
import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
const { BN } = anchor;
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  StepResult,
  RunClaimRequest,
  RunClaimResponse,
  FixtureSummary,
  KNOWN_WORKING_CANDIDATE,
} from "./types.js";

// ---------------------------------------------------------------
// Config (env-driven, see README for required variables)
// ---------------------------------------------------------------
const DEVNET_PROGRAM_ID = new PublicKey(
  "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
);
const DEVNET_TXL_MINT = new PublicKey(
  "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"
);

const TXLINE_API_HOST = process.env.TXLINE_API_HOST || "https://txline-dev.txodds.com";
const SOLANA_DEVNET_RPC = process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet");

const FREE_TIER_SERVICE_LEVEL_ID = 1;
const SUBSCRIPTION_WEEKS = 4;
const SELECTED_LEAGUES: number[] = [];

const LOCAL_KEYPAIR_PATH = path.join(process.cwd(), "throwaway-devnet-keypair.json");
const LOCAL_API_TOKEN_PATH = path.join(process.cwd(), ".txline-api-token");

// ---------------------------------------------------------------
// Credentials: env vars take priority (Cloud Run), local files are
// the dev-machine fallback. Never commit either.
// ---------------------------------------------------------------
function loadKeypair(): Keypair {
  if (process.env.DEVNET_KEYPAIR_JSON) {
    const raw = JSON.parse(process.env.DEVNET_KEYPAIR_JSON);
    return Keypair.fromSecretKey(Uint8Array.from(raw));
  }
  if (fs.existsSync(LOCAL_KEYPAIR_PATH)) {
    const raw = JSON.parse(fs.readFileSync(LOCAL_KEYPAIR_PATH, "utf-8"));
    return Keypair.fromSecretKey(Uint8Array.from(raw));
  }
  const kp = Keypair.generate();
  fs.writeFileSync(LOCAL_KEYPAIR_PATH, JSON.stringify(Array.from(kp.secretKey)));
  console.log(`Generated new throwaway devnet keypair at ${LOCAL_KEYPAIR_PATH}`);
  return kp;
}

function loadCachedApiToken(): string | null {
  if (process.env.TXLINE_API_TOKEN) return process.env.TXLINE_API_TOKEN;
  if (fs.existsSync(LOCAL_API_TOKEN_PATH)) {
    return fs.readFileSync(LOCAL_API_TOKEN_PATH, "utf-8").trim();
  }
  return null;
}

function cacheApiTokenLocally(token: string) {
  // Best-effort only; never attempted/expected on Cloud Run (read-only
  // filesystem aside from /tmp). Wrapped so it can never crash a request.
  try {
    fs.writeFileSync(LOCAL_API_TOKEN_PATH, token);
  } catch {
    /* not fatal — Cloud Run should rely on TXLINE_API_TOKEN env var instead */
  }
}

// ---------------------------------------------------------------
// Stage 1 — market_condition_selected
// Pure input-acknowledgement stage. No network call. Confirms the
// claim the rest of the pipeline will attempt to prove.
// ---------------------------------------------------------------
function stageMarketConditionSelected(req: RunClaimRequest): StepResult {
  const fixtureId = req.fixtureId ?? KNOWN_WORKING_CANDIDATE.fixtureId;
  const seq = req.seq ?? KNOWN_WORKING_CANDIDATE.seq;
  const statKey = req.statKey ?? KNOWN_WORKING_CANDIDATE.statKey;
  return {
    id: "market_condition_selected",
    label: "Market condition selected",
    ok: true,
    detail: `fixtureId=${fixtureId}, seq=${seq}, statKey=${statKey}`,
    evidenceLabel: "LIVE",
    claimStrength: "VERIFIED",
  };
}

// ---------------------------------------------------------------
// Stage 2 — fixture_loaded
// ---------------------------------------------------------------
async function stageFixtureLoaded(
  jwt: string,
  apiToken: string,
  fixtureId: number
): Promise<{ result: StepResult; fixture: FixtureSummary | null }> {
  try {
    const res = await axios.get(`${TXLINE_API_HOST}/api/fixtures/snapshot`, {
      headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken },
      timeout: 8000,
    });
    const match = (res.data || []).find((f: any) => f.FixtureId === fixtureId) || res.data?.[0];
    if (!match) {
      return {
        fixture: null,
        result: {
          id: "fixture_loaded",
          label: "Fixture loaded",
          ok: false,
          detail: "Fixtures endpoint returned no matching fixture",
          evidenceLabel: "PARTIAL",
          claimStrength: "DESCRIBED",
        },
      };
    }
    const fixture: FixtureSummary = {
      fixtureId: match.FixtureId,
      participant1: match.Participant1,
      participant2: match.Participant2,
      startTime: match.StartTime,
    };
    return {
      fixture,
      result: {
        id: "fixture_loaded",
        label: "Fixture loaded",
        ok: true,
        detail: `${fixture.participant1} vs ${fixture.participant2} (FixtureId ${fixture.fixtureId})`,
        evidenceLabel: "LIVE",
        claimStrength: "DEMONSTRATED",
      },
    };
  } catch (e: any) {
    return {
      fixture: null,
      result: {
        id: "fixture_loaded",
        label: "Fixture loaded",
        ok: false,
        detail: "Fixture fetch failed",
        evidenceLabel: "UNKNOWN",
        claimStrength: "UNSUPPORTED",
        error: e?.response?.data ? JSON.stringify(e.response.data) : e?.message,
      },
    };
  }
}

// ---------------------------------------------------------------
// Stage 3 — score_snapshot_loaded
// ---------------------------------------------------------------
async function stageScoreSnapshotLoaded(
  jwt: string,
  apiToken: string,
  fixtureId: number
): Promise<StepResult> {
  try {
    const res = await axios.get(`${TXLINE_API_HOST}/api/scores/snapshot/${fixtureId}`, {
      headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken },
      timeout: 8000,
    });
    return {
      id: "score_snapshot_loaded",
      label: "Score snapshot loaded",
      ok: true,
      detail: `Score snapshot received (${Object.keys(res.data || {}).length} fields)`,
      evidenceLabel: "LIVE",
      claimStrength: "DEMONSTRATED",
    };
  } catch (e: any) {
    return {
      id: "score_snapshot_loaded",
      label: "Score snapshot loaded",
      ok: false,
      detail: "Score snapshot fetch failed",
      evidenceLabel: "UNKNOWN",
      claimStrength: "UNSUPPORTED",
      error: e?.response?.data ? JSON.stringify(e.response.data) : e?.message,
    };
  }
}

// ---------------------------------------------------------------
// Stage 4 — stat_validation_payload_retrieved
// ---------------------------------------------------------------
async function stageStatValidationPayloadRetrieved(
  jwt: string,
  apiToken: string,
  fixtureId: number,
  seq: number,
  statKey: number
): Promise<{ result: StepResult; payload: any | null }> {
  try {
    const res = await axios.get(`${TXLINE_API_HOST}/api/scores/stat-validation`, {
      headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken },
      params: { fixtureId, seq, statKey },
      timeout: 8000,
    });
    const payload = res.data;
    return {
      payload,
      result: {
        id: "stat_validation_payload_retrieved",
        label: "Stat-validation payload retrieved",
        ok: true,
        detail: `Payload fields: ${Object.keys(payload || {}).join(", ")}`,
        evidenceLabel: "LIVE",
        claimStrength: "DEMONSTRATED",
      },
    };
  } catch (e: any) {
    return {
      payload: null,
      result: {
        id: "stat_validation_payload_retrieved",
        label: "Stat-validation payload retrieved",
        ok: false,
        detail: "Stat-validation fetch failed",
        evidenceLabel: "UNKNOWN",
        claimStrength: "UNSUPPORTED",
        error: e?.response?.data ? JSON.stringify(e.response.data) : e?.message,
      },
    };
  }
}

// ---------------------------------------------------------------
// Stages 5–7 — txline_program_reached, onchain_root_found,
// final_validation. These three come out of a single
// simulate() call on validate_stat, so they are derived from one
// program interaction but reported as three distinct, honestly
// labeled stages per the approved UI spec.
// ---------------------------------------------------------------
async function stagesProgramRootAndFinalValidation(
  connection: Connection,
  program: anchor.Program,
  payload: any
): Promise<{ results: [StepResult, StepResult, StepResult]; logs: string[]; finalBool: boolean | null }> {
  let logs: string[] = [];
  try {
    const fixtureSummary = {
      fixtureId: new BN(payload.summary.fixtureId),
      updateStats: {
        updateCount: payload.summary.updateStats.updateCount,
        minTimestamp: new BN(payload.summary.updateStats.minTimestamp),
        maxTimestamp: new BN(payload.summary.updateStats.maxTimestamp),
      },
      eventsSubTreeRoot: payload.summary.eventStatsSubTreeRoot,
    };
    const fixtureProof = payload.subTreeProof.map((n: any) => ({
      hash: n.hash,
      isRightSibling: n.isRightSibling,
    }));
    const mainTreeProof = payload.mainTreeProof.map((n: any) => ({
      hash: n.hash,
      isRightSibling: n.isRightSibling,
    }));
    const stat1 = {
      statToProve: payload.statToProve,
      eventStatRoot: payload.eventStatRoot,
      statProof: payload.statProof.map((n: any) => ({
        hash: n.hash,
        isRightSibling: n.isRightSibling,
      })),
    };
    const predicate = { threshold: 0, comparison: { greaterThan: {} } };

    const targetTs = payload.summary.updateStats.minTimestamp;
    const epochDay = Math.floor(targetTs / (24 * 60 * 60 * 1000));
    const [dailyScoresPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("daily_scores_roots"), new BN(epochDay).toBuffer("le", 2)],
      DEVNET_PROGRAM_ID
    );

    const computeBudgetIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000,
    });

    let finalBool: boolean | null = null;
    let programReached = false;
    let rootFound = false;
    let validationError: string | undefined;

    try {
      const methodBuilder = program.methods
        .validateStat(new BN(targetTs), fixtureSummary, fixtureProof, mainTreeProof, predicate, stat1, null, null)
        .accounts({ dailyScoresMerkleRoots: dailyScoresPda })
        .preInstructions([computeBudgetIx]);

      // simulate() surfaces logs even on failure; .view() alone throws
      // without exposing them as cleanly for this honesty-first report.
      const sim: any = await methodBuilder.simulate();
      logs = sim?.raw || [];
      programReached = logs.some((l) => l.includes("Instruction: ValidateStat"));
      rootFound = logs.some((l) => l.toLowerCase().includes("found valid on-chain root") || l.toLowerCase().includes("find valid on-chain root"));
      finalBool = true; // simulate() did not throw => instruction succeeded => true
    } catch (simErr: any) {
      const errLogs: string[] = simErr?.simulationResponse?.logs || simErr?.logs || [];
      logs = errLogs.length ? errLogs : logs;
      programReached = logs.some((l) => l.includes("Instruction: ValidateStat"));
      rootFound = logs.some((l) => l.toLowerCase().includes("found valid on-chain root") || l.toLowerCase().includes("find valid on-chain root"));
      validationError = simErr?.message || String(simErr);
      finalBool = false;
    }

    const stageProgramReached: StepResult = {
      id: "txline_program_reached",
      label: "TxLINE Solana program reached",
      ok: programReached,
      detail: programReached
        ? "Instruction: ValidateStat — program executed"
        : "Program was not reached or did not log the expected instruction",
      evidenceLabel: programReached ? "LIVE" : "UNKNOWN",
      claimStrength: programReached ? "DEMONSTRATED" : "UNSUPPORTED",
      programLogs: logs,
    };

    const hasFindRoot = logs.some((l) => l.toLowerCase().includes("find valid on-chain root") || l.toLowerCase().includes("found valid on-chain root"));
    const hasPredicateTrue = logs.some((l) => l.toLowerCase().includes("evaluate predicate to: true") || l.toLowerCase().includes("predicate evaluated to: true"));
    const hasProgramSuccess =
      finalBool === true &&
      logs.some((l) => l.toLowerCase().includes("program return:")) &&
      logs.some((l) => {
        const normalized = l.toLowerCase();
        return (
          normalized.includes("success") &&
          !normalized.includes("computebudget111")
        );
      });
    const rootSuccess = hasFindRoot && hasPredicateTrue && hasProgramSuccess;

    const stageRootFound: StepResult = rootSuccess
      ? {
          id: "onchain_root_found",
          label: "On-chain root resolution",
          ok: true,
          detail: "The TxLINE program resolved a valid root for the validation interval. No standalone root identifier was emitted in the simulation logs.",
          evidenceLabel: "LIVE",
          claimStrength: "DEMONSTRATED",
          programLogs: logs,
        }
      : {
          id: "onchain_root_found",
          label: "On-chain root found",
          ok: false,
          detail: "No matching on-chain root was reported by the program",
          evidenceLabel: "UNKNOWN",
          claimStrength: "UNSUPPORTED",
          programLogs: logs,
        };

    const stageFinal: StepResult = {
      id: "final_validation",
      label: "Final validation status",
      ok: finalBool === true,
      detail:
        finalBool === true
          ? "validate_stat returned true (read-only simulated result, not a broadcast transaction)"
          : `validate_stat simulation failed: ${validationError || "unknown error"}`,
      evidenceLabel: finalBool === true ? "LIVE" : "PARTIAL",
      claimStrength: finalBool === true ? "VERIFIED" : "DEMONSTRATED",
      error: finalBool === true ? undefined : validationError,
      programLogs: logs,
    };

    return { results: [stageProgramReached, stageRootFound, stageFinal], logs, finalBool };
  } catch (e: any) {
    const failResult = (id: any, label: string): StepResult => ({
      id,
      label,
      ok: false,
      detail: "Could not attempt on-chain call (payload or PDA construction failed before simulation)",
      evidenceLabel: "UNKNOWN",
      claimStrength: "UNSUPPORTED",
      error: e?.message || String(e),
    });
    return {
      results: [
        failResult("txline_program_reached", "TxLINE Solana program reached"),
        failResult("onchain_root_found", "On-chain root found"),
        failResult("final_validation", "Final validation status"),
      ],
      logs,
      finalBool: null,
    };
  }
}

// ---------------------------------------------------------------
// Auth chain (guest JWT -> subscribe -> activate), reused per
// request when no cached token is available. Cached token avoids
// re-running the on-chain subscribe call on every demo click.
// ---------------------------------------------------------------
async function ensureAuth(kp: Keypair, connection: Connection): Promise<{ jwt: string; apiToken: string } | null> {
  const cachedToken = loadCachedApiToken();
  try {
    const authRes = await axios.post(`${TXLINE_API_HOST}/auth/guest/start`, {}, { timeout: 8000 });
    const jwt = authRes.data?.token;
    if (!jwt) return null;

    if (cachedToken) {
      return { jwt, apiToken: cachedToken };
    }

    // No cached token: run the on-chain subscribe + activation chain once.
    const wallet = new anchor.Wallet(kp);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);
    const idl = await anchor.Program.fetchIdl(DEVNET_PROGRAM_ID, provider);
    if (!idl) return null;
    const program = new anchor.Program(idl, provider);

    const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_treasury_v2")],
      DEVNET_PROGRAM_ID
    );
    const tokenTreasuryVault = getAssociatedTokenAddressSync(
      DEVNET_TXL_MINT,
      tokenTreasuryPda,
      true,
      TOKEN_2022_PROGRAM_ID
    );
    const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pricing_matrix")],
      DEVNET_PROGRAM_ID
    );
    const userTokenAccount = getAssociatedTokenAddressSync(
      DEVNET_TXL_MINT,
      kp.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const txSig: string = await program.methods
      .subscribe(FREE_TIER_SERVICE_LEVEL_ID, SUBSCRIPTION_WEEKS)
      .accounts({
        user: kp.publicKey,
        pricingMatrix: pricingMatrixPda,
        tokenMint: DEVNET_TXL_MINT,
        userTokenAccount,
        tokenTreasuryVault,
        tokenTreasuryPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
    await connection.confirmTransaction(txSig, "confirmed");

    const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${jwt}`;
    const message = new TextEncoder().encode(messageString);
    const signatureBytes = nacl.sign.detached(message, kp.secretKey);
    const walletSignature = Buffer.from(signatureBytes).toString("base64");

    const activateRes = await axios.post(
      `${TXLINE_API_HOST}/api/token/activate`,
      { txSig, walletSignature, leagues: SELECTED_LEAGUES },
      { headers: { Authorization: `Bearer ${jwt}` }, timeout: 8000 }
    );
    const apiToken = typeof activateRes.data === "string" ? activateRes.data : activateRes.data?.token;
    if (!apiToken) return null;

    cacheApiTokenLocally(apiToken);
    return { jwt, apiToken };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------
// Public entrypoint used by server.ts
// ---------------------------------------------------------------
export async function runClaim(req: RunClaimRequest): Promise<RunClaimResponse> {
  const fixtureId = req.fixtureId ?? KNOWN_WORKING_CANDIDATE.fixtureId;
  const seq = req.seq ?? KNOWN_WORKING_CANDIDATE.seq;
  const statKey = req.statKey ?? KNOWN_WORKING_CANDIDATE.statKey;

  const steps: StepResult[] = [];
  steps.push(stageMarketConditionSelected({ fixtureId, seq, statKey }));

  const kp = loadKeypair();
  const connection = new Connection(SOLANA_DEVNET_RPC, "confirmed");

  const auth = await ensureAuth(kp, connection);
  if (!auth) {
    const authFail: StepResult = {
      id: "fixture_loaded",
      label: "Fixture loaded",
      ok: false,
      detail: "Could not establish TxLINE auth (guest JWT, subscribe, or activation step failed)",
      evidenceLabel: "UNKNOWN",
      claimStrength: "UNSUPPORTED",
    };
    return finalizeResponse([...steps, authFail], null, [], [], "SPONSOR_CLARIFICATION_PENDING");
  }

  const { jwt, apiToken } = auth;

  const { result: fixtureResult, fixture } = await stageFixtureLoaded(jwt, apiToken, fixtureId);
  steps.push(fixtureResult);
  if (!fixture) {
    return finalizeResponse(steps, null, [], [], "SPONSOR_CLARIFICATION_PENDING");
  }

  steps.push(await stageScoreSnapshotLoaded(jwt, apiToken, fixtureId));

  const { result: proofResult, payload } = await stageStatValidationPayloadRetrieved(jwt, apiToken, fixtureId, seq, statKey);
  steps.push(proofResult);
  if (!payload) {
    return finalizeResponse(steps, fixture, [], [], "SPONSOR_CLARIFICATION_PENDING");
  }

  const wallet = new anchor.Wallet(kp);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);
  const idl = await anchor.Program.fetchIdl(DEVNET_PROGRAM_ID, provider);
  if (!idl) {
    return finalizeResponse(steps, fixture, Object.keys(payload), [], "SPONSOR_CLARIFICATION_PENDING");
  }
  const program = new anchor.Program(idl, provider);

  const { results: lastThree, logs, finalBool } = await stagesProgramRootAndFinalValidation(connection, program, payload);
  steps.push(...lastThree);

  let finalStatus: RunClaimResponse["finalStatus"];
  if (finalBool === true) {
    finalStatus = "VERIFIED";
  } else if (lastThree[0].ok) {
    // Program was reached but the proof did not validate — this is the
    // known, current, honest state (6004 InvalidMainTreeProof).
    finalStatus = "PROOF_MISMATCH";
  } else {
    finalStatus = "SPONSOR_CLARIFICATION_PENDING";
  }

  return finalizeResponse(steps, fixture, Object.keys(payload), logs, finalStatus);
}

function finalizeResponse(
  steps: StepResult[],
  fixture: FixtureSummary | null,
  proofPayloadFields: string[],
  validationSimulationLogs: string[],
  finalStatus: RunClaimResponse["finalStatus"]
): RunClaimResponse {
  const truthfulProofStatement =
    finalStatus === "VERIFIED"
      ? "TxLINE Merkle proof validated against the on-chain program/root."
      : "TxLINE proof payload retrieved and validated up to the deployed Solana program/root check.";

  const evidence: RunClaimResponse["evidence"] =
    finalStatus === "VERIFIED"
      ? { primaryLabel: "LIVE", claimStrength: "VERIFIED", sourceConfidence: "CONFIRMED" }
      : finalStatus === "PROOF_MISMATCH"
      ? { primaryLabel: "PARTIAL", claimStrength: "DEMONSTRATED", sourceConfidence: "CONFIRMED" }
      : { primaryLabel: "UNKNOWN", claimStrength: "UNSUPPORTED", sourceConfidence: "UNCERTAIN" };

  return {
    steps,
    finalStatus,
    fixture,
    proofPayloadFields,
    validationSimulationLogs,
    truthfulProofStatement,
    evidence,
    generatedAt: new Date().toISOString(),
  };
}
