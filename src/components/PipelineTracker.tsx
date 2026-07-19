import type { CSSProperties } from "react";
import type { StepResult, PipelineStageId } from "../types";
type JourneyStage = { label: string; ids: PipelineStageId[] };
const JOURNEY: JourneyStage[] = [
  { label: "Claim", ids: ["market_condition_selected", "fixture_loaded"] },
  { label: "Payload", ids: ["score_snapshot_loaded", "stat_validation_payload_retrieved"] },
  { label: "TxLINE program", ids: ["txline_program_reached"] }, { label: "Root", ids: ["onchain_root_found"] },
  { label: "Predicate true", ids: ["final_validation"] }, { label: "Verdict", ids: ["final_validation"] },
];
export default function PipelineTracker({ steps, isLoading }: { steps: StepResult[]; isLoading: boolean }) {
  const byId = new Map(steps.map((step) => [step.id, step]));
  return <ol className="journey" aria-label="Verification stages">{JOURNEY.map((stage, index) => {
    const related = stage.ids.map((id) => byId.get(id)).filter(Boolean) as StepResult[];
    const complete = related.length === stage.ids.length && related.every((step) => step.ok);
    const failed = related.some((step) => !step.ok);
    const state = failed ? "failed" : complete ? "complete" : isLoading ? "active" : "waiting";
    return <li className={`journey-stage is-${state}`} key={stage.label} style={{ "--stage": index } as CSSProperties}><span className="stage-index">{String(index + 1).padStart(2, "0")}</span><span className="stage-node" aria-hidden="true"><i /></span><span className="stage-label">{stage.label}</span><span className="sr-only">{state}</span></li>;
  })}</ol>;
}
