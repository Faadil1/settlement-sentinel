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

function iconFor(step: StepResult | undefined, isWaiting: boolean) {
  if (isWaiting) return "○";
  if (!step) return "○";
  return step.ok ? "✓" : "✕";
}

function colorFor(step: StepResult | undefined, isWaiting: boolean) {
  if (isWaiting) return "#5A6472";
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
  const hasResults = steps.length > 0;

  // While loading with no results yet, show a generic "Verifying…" state
  // Do NOT imply per-step streaming — the backend returns all steps at once
  if (isLoading && !hasResults) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0" }}>
        <div style={pulseCircleStyle} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#E8EAED" }}>
            Verifying…
          </div>
          <div style={{ fontSize: 13, color: "#7A828E", marginTop: 2 }}>
            Running all pipeline stages against TxLINE devnet
          </div>
        </div>
      </div>
    );
  }

  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {STAGE_ORDER.map((id, idx) => {
        const step = byId.get(id);
        const isLast = idx === STAGE_ORDER.length - 1;
        const stepColor = colorFor(step, false);
        return (
          <li
            key={id}
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 14,
            }}
          >
            {/* Vertical rail + circle */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 28,
                flexShrink: 0,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${stepColor}`,
                  color: stepColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: step?.ok ? "rgba(61, 153, 112, 0.1)" : "transparent",
                }}
              >
                {iconFor(step, false)}
              </div>
              {/* Rail connector */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    width: 2,
                    background: step?.ok
                      ? "rgba(61, 153, 112, 0.35)"
                      : "#2A2F38",
                    minHeight: 12,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.08em", color: "#5A6472", fontWeight: 500 }}>
                  STAGE {idx + 1} OF {STAGE_ORDER.length}
                </span>
                {step && (
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.06em",
                      color: step.ok ? "#3D9970" : "#C77B1E",
                      fontFamily: "ui-monospace, monospace",
                      fontWeight: 600,
                    }}
                  >
                    {step.evidenceLabel}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: "#E8EAED" }}>
                {step?.label ?? formatLabel(id)}
              </div>
              <div style={{ fontSize: 13, color: "#A8AFB8", marginTop: 2 }}>
                {step?.detail ?? "Not yet attempted"}
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

const pulseCircleStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "2px solid #3D6BFF",
  animation: "pulse 1.5s ease-in-out infinite",
};

// Inject keyframes for the pulse animation
if (typeof document !== "undefined") {
  const styleId = "pipeline-pulse-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(61, 107, 255, 0.4); }
        50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(61, 107, 255, 0); }
      }
    `;
    document.head.appendChild(style);
  }
}
