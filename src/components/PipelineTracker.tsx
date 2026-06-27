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

function iconFor(step: StepResult | undefined, isPending: boolean) {
  if (isPending) return "○";
  if (!step) return "○";
  return step.ok ? "✓" : "✕";
}

function colorFor(step: StepResult | undefined, isPending: boolean) {
  if (isPending) return "#5A6472";
  if (!step) return "#5A6472";
  return step.ok ? "#3D9970" : "#C77B1E"; // green for ok, amber (not red) for a real-but-failed step
}

export default function PipelineTracker({
  steps,
  isLoading,
}: {
  steps: StepResult[];
  isLoading: boolean;
}) {
  const byId = new Map(steps.map((s) => [s.id, s]));

  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {STAGE_ORDER.map((id, idx) => {
        const step = byId.get(id);
        const isPending = isLoading && !step;
        return (
          <li
            key={id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: "14px 0",
              borderBottom: idx < STAGE_ORDER.length - 1 ? "1px solid #2A2F38" : "none",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: `2px solid ${colorFor(step, isPending)}`,
                color: colorFor(step, isPending),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {iconFor(step, isPending)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 11, letterSpacing: "0.08em", color: "#7A828E" }}>
                  STAGE {idx + 1} OF {STAGE_ORDER.length}
                </span>
                {step && (
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.06em",
                      color: "#7A828E",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {step.evidenceLabel}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, color: "#E8EAED" }}>
                {step?.label ?? formatLabel(id)}
              </div>
              <div style={{ fontSize: 13, color: "#A8AFB8", marginTop: 2 }}>
                {isPending ? "Waiting…" : step?.detail ?? "Not yet attempted"}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatLabel(id: string): string {
  return id
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
