import React from "react";
import type { StepResult } from "../types";

const STAGE_ORDER = [
  "market_condition_selected",
  "fixture_loaded",
  "score_snapshot_loaded",
  "stat_validation_payload_retrieved",
  "txline_program_reached",
  "onchain_root_found",
  "final_validation",
] as const;

const RESOLUTION_TIMELINE_LABELS: Record<(typeof STAGE_ORDER)[number], string> = {
  market_condition_selected: "Claim selected",
  fixture_loaded: "Match record loaded",
  score_snapshot_loaded: "Score state loaded",
  stat_validation_payload_retrieved: "Merkle proof received",
  txline_program_reached: "TxLINE program reached",
  onchain_root_found: "On-chain root found",
  final_validation: "Verdict returned",
};

function iconFor(step: StepResult | undefined, isPending: boolean): string {
  if (isPending) return "·";
  if (!step) return "·";
  return step.ok ? "✓" : "✕";
}

function colorFor(step: StepResult | undefined, isPending: boolean): string {
  if (isPending) return "#524E48";
  if (!step) return "#524E48";
  return step.ok ? "#3D6B3D" : "#A05A2C";
}

export default function PipelineTracker({
  steps,
  isLoading,
  isUnavailable,
}: {
  steps: StepResult[];
  isLoading: boolean;
  isUnavailable?: boolean;
}) {
  if (isUnavailable) {
    return (
      <div style={{ color: "#7A756A", fontSize: 13, fontStyle: "italic", padding: "4px 0" }}>
        Proof check unavailable (local preview).
      </div>
    );
  }

  const byId = new Map(steps.map((s) => [s.id, s]));

  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {STAGE_ORDER.map((id, idx) => {
        const step = byId.get(id);
        const isPending = isLoading && !step;
        const stepColor = colorFor(step, isPending);
        return (
          <li
            key={id}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              padding: "4px 0",
            }}
          >
            <span
              style={{
                width: 14,
                textAlign: "center",
                fontSize: 12,
                fontWeight: 700,
                color: stepColor,
                flexShrink: 0,
              }}
            >
              {iconFor(step, isPending)}
            </span>
            <span style={{ fontSize: 11, color: "#524E48", fontWeight: 500, width: 14, flexShrink: 0 }}>
              {idx + 1}
            </span>
            <span style={{ fontSize: 13, color: "#C8C2B6", fontWeight: 500 }}>
              {RESOLUTION_TIMELINE_LABELS[id]}
            </span>
            {step && (
              <span style={{ fontSize: 11, color: "#524E48", marginLeft: "auto", fontFamily: "ui-monospace, monospace" }}>
                {step.evidenceLabel}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
