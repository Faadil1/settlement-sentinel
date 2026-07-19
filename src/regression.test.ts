import { runClaim } from "./pipeline.js";
import assert from "assert";
import axios from "axios";
import * as anchor from "@coral-xyz/anchor";

// Set environment variables to bypass actual wallet configuration/on-chain subscription
process.env.TXLINE_API_TOKEN = "mock-api-token";

// Mock Anchor fetchIdl
anchor.Program.fetchIdl = async () => {
  return { version: "0.1.0", name: "txline", instructions: [], address: "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J" } as any;
};

// Global variables to control mocked logs and simulation status in Solana simulation
let mockLogs: string[] = [];
let simulateThrows = false;

// Mock Anchor Program.prototype.methods
Object.defineProperty(anchor.Program.prototype, "methods", {
  get() {
    return {
      validateStat: () => {
        return {
          accounts: () => {
            return {
              preInstructions: () => {
                return {
                  simulate: async () => {
                    if (simulateThrows) {
                      const err: any = new Error("Simulation failed");
                      err.logs = mockLogs;
                      throw err;
                    }
                    return { raw: mockLogs };
                  }
                };
              }
            };
          }
        };
      }
    };
  },
  set(val) {
    // Ignore setting the property during constructor initialization
  },
  configurable: true
});

// Mock axios.post
axios.post = async (url: string, data?: any, config?: any): Promise<any> => {
  if (url.endsWith("/auth/guest/start")) {
    return { data: { token: "mock-jwt" } };
  }
  throw new Error(`Unexpected POST request to ${url}`);
};

// Mock axios.get
axios.get = async (url: string, config?: any): Promise<any> => {
  if (url.endsWith("/api/fixtures/snapshot")) {
    return {
      data: [
        {
          FixtureId: 17588309,
          Participant1: "Egypt",
          Participant2: "Iran",
          StartTime: 1782529200000
        }
      ]
    };
  }
  if (url.includes("/api/scores/snapshot/")) {
    return { data: { someField: 1 } };
  }
  if (url.includes("/api/scores/stat-validation")) {
    const params = config?.params || {};
    if (params.fixtureId === 17588309 && params.statKey === 1002 && params.seq === 1141) {
      return {
        data: {
          summary: {
            fixtureId: 17588309,
            updateStats: {
              updateCount: 1,
              minTimestamp: 1782529200000,
              maxTimestamp: 1782529200000
            },
            eventStatsSubTreeRoot: new Uint8Array(32)
          },
          subTreeProof: [],
          mainTreeProof: [],
          statToProve: {},
          eventStatRoot: new Uint8Array(32),
          statProof: []
        }
      };
    }
    // Return empty / throw for invalid fixture/statKey
    throw new Error(`No mock validation payload for params: ${JSON.stringify(params)}`);
  }
  throw new Error(`Unexpected GET request to ${url}`);
};

async function testA() {
  console.log("Running Regression Test A (fixtureId 17588309, seq 1141, statKey 1002)...");
  // Set logs to represent success case with "Find valid on-chain root" and predicate evaluated to true
  mockLogs = [
    "Program log: Instruction: ValidateStat",
    "Program log: SUCCESS: Account integrity verified",
    "Program log: Find valid on-chain root for interval 62",
    "Program log: Evaluate predicate to: true",
    "Program return: 6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J AQ==",
    "Program success"
  ];
  simulateThrows = false;

  const res = await runClaim({
    fixtureId: 17588309,
    seq: 1141,
    statKey: 1002,
  });

  console.log("Test A Response finalStatus:", res.finalStatus);
  try {
    assert.strictEqual(res.finalStatus, "VERIFIED");
  } catch (e) {
    console.error("Test A Response details:", JSON.stringify(res, null, 2));
    throw e;
  }

  const step = res.steps.find((s) => s.id === "onchain_root_found");
  assert.ok(step, "onchain_root_found step should exist");
  assert.strictEqual(step.ok, true, "onchain_root_found should be ok=true");
  assert.strictEqual(step.label, "On-chain root resolution");
  assert.strictEqual(step.detail, "The TxLINE program resolved a valid root for the validation interval. No standalone root identifier was emitted in the simulation logs.");
  assert.strictEqual(step.evidenceLabel, "LIVE");
  assert.strictEqual(step.claimStrength, "DEMONSTRATED");

  // Verify that the exact statement "TxLINE Merkle proof validated against the on-chain program/root." is preserved
  assert.strictEqual(res.truthfulProofStatement, "TxLINE Merkle proof validated against the on-chain program/root.");

  // Check no standalone root hash is claimed/exposed in the detail or other fields
  assert.ok(!step.detail.includes("0x"), "No standalone root hash should be claimed in detail");
  assert.ok(!step.detail.match(/[0-9a-fA-F]{64}/), "No standalone sha256 root hash should be claimed in detail");

  console.log("Test A Passed!");
}

async function testB() {
  console.log("Running Regression Test B (statKey 999999)...");
  const res = await runClaim({
    fixtureId: 17588309,
    seq: 1141,
    statKey: 999999,
  });

  console.log("Test B Response finalStatus:", res.finalStatus);
  assert.notStrictEqual(res.finalStatus, "VERIFIED", "Invalid statKey must remain non-VERIFIED");
  console.log("Test B Passed!");
}

async function testC() {
  console.log("Running Regression Test C (fixtureId 1, seq 1)...");
  const res = await runClaim({
    fixtureId: 1,
    seq: 1,
    statKey: 1002,
  });

  console.log("Test C Response finalStatus:", res.finalStatus);
  assert.notStrictEqual(res.finalStatus, "VERIFIED", "Invalid fixture must remain non-VERIFIED");
  console.log("Test C Passed!");
}

async function runAll() {
  try {
    await testA();
    await testB();
    await testC();
    console.log("All regression tests passed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Regression test suite failed:", err);
    process.exit(1);
  }
}

runAll();
