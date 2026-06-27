/**
 * Settlement Sentinel — server
 * ------------------------------------------------------------------
 * One Express process serves both the API and the built frontend.
 * No escrow / wagering / settlement routes exist or will be added.
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { runClaim } from "./pipeline.js";
import { RunClaimRequest } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.use(express.json());

app.post("/api/run-claim", async (req, res) => {
  try {
    const body: RunClaimRequest = {
      fixtureId: req.body?.fixtureId,
      seq: req.body?.seq,
      statKey: req.body?.statKey,
    };
    const result = await runClaim(body);
    res.json(result);
  } catch (e: any) {
    // Even an unexpected crash returns a structured, honest shape —
    // never a fabricated success.
    res.status(500).json({
      steps: [],
      finalStatus: "ERROR",
      fixture: null,
      proofPayloadFields: [],
      validationSimulationLogs: [],
      truthfulProofStatement: "Pipeline did not complete due to an unexpected server error.",
      evidence: { primaryLabel: "UNKNOWN", claimStrength: "UNSUPPORTED", sourceConfidence: "NOT_FOUND" },
      generatedAt: new Date().toISOString(),
      error: e?.message || String(e),
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "settlement-sentinel" });
});

// Serve the built Vite frontend (dist/) for every other route.
const distDir = path.join(__dirname, "..", "dist");
app.use(express.static(distDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Settlement Sentinel listening on port ${PORT}`);
  console.log(`TXLINE_API_HOST=${process.env.TXLINE_API_HOST || "https://txline-dev.txodds.com (default)"}`);
});
