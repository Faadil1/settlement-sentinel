import React from "react";
import type { FinalStatus } from "../types";

const CONFIG: Record<FinalStatus | "PENDING" | "UNAVAILABLE", { label: string; color: string; borderColor: string; bgColor: string; icon: string }> = {
  VERIFIED: {
    label: "VERIFIED",
    color: "#3D6B3D",
    borderColor: "#3D6B3D",
    bgColor: "rgba(61, 107, 61, 0.04)",
    icon: "✓",
  },
  PROOF_MISMATCH: {
    label: "PROOF MISMATCH",
    color: "#A05A2C",
    borderColor: "#A05A2C",
    bgColor: "rgba(160, 90, 44, 0.04)",
    icon: "✕",
  },
  SPONSOR_CLARIFICATION_PENDING: {
    label: "PENDING",
    color: "#7A756A",
    borderColor: "#7A756A",
    bgColor: "rgba(122, 117, 106, 0.04)",
    icon: "…",
  },
  ERROR: {
    label: "ERROR",
    color: "#A05A2C",
    borderColor: "#A05A2C",
    bgColor: "rgba(160, 90, 44, 0.04)",
    icon: "✕",
  },
  PENDING: {
    label: "PENDING",
    color: "#7A756A",
    borderColor: "#7A756A",
    bgColor: "rgba(122, 117, 106, 0.04)",
    icon: "○",
  },
  UNAVAILABLE: {
    label: "UNAVAILABLE",
    color: "#A05A2C",
    borderColor: "#A05A2C",
    bgColor: "rgba(160, 90, 44, 0.04)",
    icon: "✕",
  },
};

/**
 * Official status stamp element designed to sit inside VerdictReceipt.
 * Styled to look like a physical ink stamp on paper.
 */
export default function StatusBadge({ status }: { status: FinalStatus | "PENDING" | "UNAVAILABLE" }) {
  const cfg = CONFIG[status];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 24px",
        borderRadius: 4,
        border: `3px double ${cfg.borderColor}`,
        background: cfg.bgColor,
        color: cfg.color,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "0.12em",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        transform: "rotate(-1.5deg)",
        boxShadow: "0 0 2px rgba(0,0,0,0.05)",
      }}
    >
      <span style={{ fontSize: 14 }}>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </div>
  );
}
