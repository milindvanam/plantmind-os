import {
  formatSimulatedTime,
  getStageAt,
  sampleAt,
  type ReplayState,
  type ScenarioStage
} from "@/lib/scenario";

export type CommandMetric = {
  id: string;
  label: string;
  value: string;
  unit: string;
  detail: string;
  source: string;
  asOf: string;
  status: ScenarioStage["state"] | "neutral";
};

export type CommandSnapshot = {
  scenarioId: string;
  asOf: string;
  stage: ScenarioStage;
  replayStatus: ReplayState["status"];
  priority: {
    active: boolean;
    title: string;
    summary: string;
    decisionClock: string;
  };
  metrics: CommandMetric[];
  impact: {
    status: "unavailable";
    productionRange: null;
    financialRange: null;
    reason: string;
  };
  operationsBrief: {
    status: "not-generated";
    reason: string;
  };
  action: {
    status: "not-started";
    owner: string;
    nextCheckpoint: string;
  };
  trust: {
    truth: "simulated-replay";
    evidenceQuality: "indeterminate";
    confidence: "not-scored";
    audit: "replay-traceable";
    reasons: string[];
  };
};

export function buildCommandSnapshot(state: ReplayState): CommandSnapshot {
  const stage = getStageAt(state.elapsedMinutes);
  const sample = sampleAt(state.elapsedMinutes);
  const asOf = formatSimulatedTime(state.elapsedMinutes);
  const active = !["normal", "recovery"].includes(stage.id);

  return {
    scenarioId: state.scenarioId,
    asOf,
    stage,
    replayStatus: state.status,
    priority: {
      active,
      title: active
        ? `P-204A requires ${stage.shortLabel.toLowerCase()} attention`
        : "No active operational risk at this scenario stage",
      summary: active
        ? `${stage.description} This is replay context only; diagnosis and impact remain unavailable until their deterministic engines are approved.`
        : "The current replay snapshot is within its normal or recovery stage. No analytical risk claim has been generated.",
      decisionClock: active ? "Decision window not calculated" : "No decision requested"
    },
    metrics: [
      {
        id: "throughput",
        label: "Line throughput",
        value: sample.throughput.toFixed(1),
        unit: "% plan",
        detail: "Simulated production context",
        source: "OperationalMetric · throughput_vs_plan",
        asOf,
        status: stage.state
      },
      {
        id: "flow",
        label: "Pump flow",
        value: sample.flow.toFixed(1),
        unit: "m³/h",
        detail: "Replayed process measurement",
        source: "P204A-FLOW",
        asOf,
        status: stage.state
      },
      {
        id: "power",
        label: "Pump power",
        value: sample.power.toFixed(1),
        unit: "kW",
        detail: "Replayed electrical measurement",
        source: "P204A-POWER",
        asOf,
        status: stage.state
      },
      {
        id: "priority-assets",
        label: "Priority assets",
        value: active ? "1" : "0",
        unit: "replay context",
        detail: active ? "P-204A is the current focus" : "No focus asset at this stage",
        source: "ScenarioStage · deterministic fixture",
        asOf,
        status: active ? stage.state : "neutral"
      }
    ],
    impact: {
      status: "unavailable",
      productionRange: null,
      financialRange: null,
      reason:
        "Impact Assessment is Priority 7 and has not been implemented. Missing values are never displayed as zero."
    },
    operationsBrief: {
      status: "not-generated",
      reason:
        "AI Operations Executive is Priority 3. No model-authored interpretation exists in this milestone."
    },
    action: {
      status: "not-started",
      owner: "Named Plant Head · future governed workflow",
      nextCheckpoint: active
        ? "Review deterministic evidence when available"
        : "Continue scenario replay"
    },
    trust: {
      truth: "simulated-replay",
      evidenceQuality: "indeterminate",
      confidence: "not-scored",
      audit: "replay-traceable",
      reasons: [
        "Synthetic source records are clearly labelled",
        "Evidence Collection and Confidence engines are not yet implemented",
        "No AI, financial, diagnostic, or control claim is present"
      ]
    }
  };
}
