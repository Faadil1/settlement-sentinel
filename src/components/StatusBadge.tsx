import React from "react";
import type { FinalStatus } from "../types";

const CONFIG: Record<FinalStatus, { label: string; bg: string; fg: string; description: string }> = {
  VERIFIED: {
    label: "VERIFIED",
    bg: "#1B4332",
    fg: "#D8F3DC",
    description: "validate_stat returned true against the live on-chain root.",
  },
  PROOF_MISMATCH: {
    label: "PROOF_MISMATCH",
    bg: "#7C5800",
    fg: "#FFE9B0",
    description:
      "The program was reached and a valid root was found, but the submitted proof did not match it (error 6004 — InvalidMainTreeProof).",
  },
  SPONSOR_CLARIFICATION_PENDING: {
    label: "SPONSOR_CLARIFICATION_PENDING",
    bg: "#22324A",
    fg: "#CBD9EE",
    description: "Waiting on a known-good example from TxLINE support before this can be diagnosed further.",
  },
  ERROR: {
    label: "ERROR",
    bg: "#4A2222",
    fg: "#F3D3D3",
    description: "The pipeline did not complete due to an unexpected failure.",
  },
};

export default function StatusBadge({ status }: { status: FinalStatus }) {
  const cfg = CONFIG[status];
  return (
    <div
      style={{
        borderRadius: 8,
        padding: "16px 20px",
        background: cfg.bg,
        color: cfg.fg,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: "0.08em", opacity: 0.75, marginBottom: 6 }}>
        FINAL STATUS
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{cfg.label}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.9 }}>{cfg.description}</div>
    </div>
  );
}
