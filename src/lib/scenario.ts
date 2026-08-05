export const SCENARIO_ID = "pump-degradation-p204a";
export const SCENARIO_START = "2026-03-17T06:00:00.000Z";
export const SCENARIO_DURATION_MINUTES = 480;

export type ScenarioStageId =
  "normal" | "degradation" | "warning" | "critical" | "intervention" | "recovery";
export type ReplayStatus = "idle" | "running" | "paused" | "complete";

export type ScenarioStage = {
  id: ScenarioStageId;
  label: string;
  shortLabel: string;
  startMinute: number;
  description: string;
  state: "healthy" | "watch" | "warning" | "critical" | "action" | "recovering";
};

export const SCENARIO_STAGES: readonly ScenarioStage[] = [
  {
    id: "normal",
    label: "Normal operation",
    shortLabel: "Normal",
    startMinute: 0,
    description: "Stable process conditions within the simulated baseline.",
    state: "healthy"
  },
  {
    id: "degradation",
    label: "Early degradation",
    shortLabel: "Degradation",
    startMinute: 120,
    description: "A controlled drift begins in the replayed sensor history.",
    state: "watch"
  },
  {
    id: "warning",
    label: "Warning conditions",
    shortLabel: "Warning",
    startMinute: 240,
    description: "Several simulated measurements move outside their operating bands.",
    state: "warning"
  },
  {
    id: "critical",
    label: "Critical conditions",
    shortLabel: "Critical",
    startMinute: 330,
    description: "The replay reaches its highest-risk operating state.",
    state: "critical"
  },
  {
    id: "intervention",
    label: "Intervention window",
    shortLabel: "Intervention",
    startMinute: 390,
    description: "A planned operator intervention is represented in the dataset.",
    state: "action"
  },
  {
    id: "recovery",
    label: "Recovery",
    shortLabel: "Recovery",
    startMinute: 450,
    description: "Measurements return toward the simulated operating baseline.",
    state: "recovering"
  }
] as const;

export const REPLAY_SPEEDS = [1, 4, 12, 24] as const;
export type ReplaySpeed = (typeof REPLAY_SPEEDS)[number];

export type ReplayState = {
  scenarioId: typeof SCENARIO_ID;
  status: ReplayStatus;
  elapsedMinutes: number;
  speed: ReplaySpeed;
  updatedAt: string;
};

export const initialReplayState = (): ReplayState => ({
  scenarioId: SCENARIO_ID,
  status: "idle",
  elapsedMinutes: 0,
  speed: 12,
  updatedAt: new Date().toISOString()
});

export function clampElapsed(minutes: number) {
  return Math.max(0, Math.min(SCENARIO_DURATION_MINUTES, minutes));
}

export function getStageAt(elapsedMinutes: number): ScenarioStage {
  const value = clampElapsed(elapsedMinutes);
  return (
    [...SCENARIO_STAGES].reverse().find((stage) => value >= stage.startMinute) ??
    SCENARIO_STAGES[0]!
  );
}

export function getSimulatedTimestamp(elapsedMinutes: number) {
  return new Date(new Date(SCENARIO_START).getTime() + clampElapsed(elapsedMinutes) * 60_000);
}

export function formatSimulatedTime(elapsedMinutes: number) {
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC"
    }).format(getSimulatedTimestamp(elapsedMinutes)) + " UTC"
  );
}

export function progressReplay(state: ReplayState, deltaRealSeconds: number): ReplayState {
  if (state.status !== "running") return state;
  const elapsedMinutes = clampElapsed(state.elapsedMinutes + deltaRealSeconds * state.speed);
  return {
    ...state,
    elapsedMinutes,
    status: elapsedMinutes >= SCENARIO_DURATION_MINUTES ? "complete" : "running",
    updatedAt: new Date().toISOString()
  };
}

export type ScenarioSample = {
  minute: number;
  vibration: number;
  temperature: number;
  pressure: number;
  flow: number;
  power: number;
  throughput: number;
};

export function sampleAt(minute: number): ScenarioSample {
  const t = clampElapsed(minute);
  const stage = getStageAt(t);
  const factors: Record<ScenarioStageId, [number, number, number, number, number, number]> = {
    normal: [2.1, 61, 5.2, 238, 86, 96],
    degradation: [3.2, 67, 5.0, 229, 91, 94],
    warning: [5.6, 76, 4.7, 213, 99, 89],
    critical: [8.4, 88, 4.1, 186, 112, 78],
    intervention: [3.4, 70, 4.5, 204, 82, 84],
    recovery: [2.4, 63, 5.1, 232, 87, 95]
  };
  const [vibration, temperature, pressure, flow, power, throughput] = factors[stage.id];
  const wave = Math.sin(t / 17) * 0.04;
  return {
    minute: t,
    vibration: +(vibration + wave).toFixed(2),
    temperature: +(temperature + wave * 4).toFixed(1),
    pressure: +(pressure + wave / 2).toFixed(2),
    flow: +(flow + wave * 12).toFixed(1),
    power: +(power + wave * 5).toFixed(1),
    throughput: +(throughput + wave * 8).toFixed(1)
  };
}
