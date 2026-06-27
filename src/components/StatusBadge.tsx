import React from "react";
import type { FinalStatus } from "../types";

const CONFIG: Record<FinalStatus, { label: string; bg: string; fg: string; description: string; glow?: string; icon: string }> = {
  VERIFIED: {
    label: "VERIFIED",
    bg: "#1B4332",
    fg: "#D8F3DC",
    description: "validate_stat returned true against the live on-chain root.",
    glow: "0 0 24px rgba(56, 176, 108, 0.35), 0 0 48px rgba(56, 176, 108, 0.12)",
    icon: "🛡\uFE0F",
  },
  PROOF_MISMATCH: {
    label: "PROOF_MISMATCH",
    bg: "#7C5800",
    fg: "#FFE9B0",
    description:
      "The program was reached and a valid root was found, but the submitted proof did not match it (error 6004 — InvalidMainTreeProof).",
    icon: "⚠",
  },
  SPONSOR_CLARIFICATION_PENDING: {
    label: "SPONSOR_CLARIFICATION_PENDING",
    bg: "#22324A",
    fg: "#CBD9EE",
    description: "Waiting on a known-good example from TxLINE support before this can be diagnosed further.",
    icon: "⏳",
  },
  ERROR: {
    label: "ERROR",
    bg: "#4A2222",
    fg: "#F3D3D3",
    description: "The pipeline did not complete due to an unexpected failure.",
    icon: "✕",
  },
};

export default function StatusBadge({ status }: { status: FinalStatus }) {
  const cfg = CONFIG[status];
  return (
    <div
      style={{
        borderRadius: 10,
        padding: "18px 22px",
        background: cfg.bg,
        color: cfg.fg,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        boxShadow: cfg.glow ?? "none",
        border: status === "VERIFIED" ? "1px solid rgba(56, 176, 108, 0.3)" : "1px solid transparent",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.65, marginBottom: 6, textTransform: "uppercase" }}>
        Final Status
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.9 }}>{cfg.description}</div>
    </div>
  );
}
