import {
  clampElapsed,
  getSimulatedTimestamp,
  getStageAt,
  sampleAt,
  SCENARIO_DURATION_MINUTES,
  SCENARIO_STAGES,
  type ScenarioSample,
  type ScenarioStageId
} from "@/lib/scenario";

export const TIMELINE_SAMPLE_INTERVAL_MINUTES = 10;

export type TimelineSignalKey = "vibration" | "temperature" | "flow";

export type TimelineSignal = {
  key: TimelineSignalKey;
  label: string;
  unit: string;
  source: string;
  domain: readonly [number, number];
};

export const TIMELINE_SIGNALS: readonly TimelineSignal[] = [
  {
    key: "vibration",
    label: "Vibration",
    unit: "mm/s RMS",
    source: "P204A-VIB-01",
    domain: [0, 10]
  },
  {
    key: "temperature",
    label: "Bearing temperature",
    unit: "°C",
    source: "P204A-TEMP-01",
    domain: [50, 95]
  },
  { key: "flow", label: "Discharge flow", unit: "m³/h", source: "P204A-FLOW", domain: [170, 250] }
] as const;

export type TimelineSample = ScenarioSample & {
  timestamp: string;
  stageId: ScenarioStageId;
};

export type TimelineStageSegment = {
  id: ScenarioStageId;
  label: string;
  shortLabel: string;
  description: string;
  startMinute: number;
  endMinute: number;
  startPercent: number;
  widthPercent: number;
  status: "complete" | "current" | "future";
  timestamp: string;
};

function formatTimelineTime(minute: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(getSimulatedTimestamp(minute));
}

export function buildTimelineSamples(): TimelineSample[] {
  const samples: TimelineSample[] = [];
  for (
    let minute = 0;
    minute <= SCENARIO_DURATION_MINUTES;
    minute += TIMELINE_SAMPLE_INTERVAL_MINUTES
  ) {
    samples.push({
      ...sampleAt(minute),
      timestamp: formatTimelineTime(minute),
      stageId: getStageAt(minute).id
    });
  }
  return samples;
}

export function normalizeTimelineValue(value: number, domain: readonly [number, number]) {
  const [minimum, maximum] = domain;
  if (maximum <= minimum) return 50;
  return Math.max(0, Math.min(100, ((value - minimum) / (maximum - minimum)) * 100));
}

export function buildTimelineModel(elapsedMinutes: number) {
  const elapsed = clampElapsed(elapsedMinutes);
  const activeStage = getStageAt(elapsed);
  const samples = buildTimelineSamples();
  const currentSample = sampleAt(elapsed);
  const segments: TimelineStageSegment[] = SCENARIO_STAGES.map((stage, index) => {
    const nextStage = SCENARIO_STAGES[index + 1];
    const endMinute = nextStage?.startMinute ?? SCENARIO_DURATION_MINUTES;
    return {
      id: stage.id,
      label: stage.label,
      shortLabel: stage.shortLabel,
      description: stage.description,
      startMinute: stage.startMinute,
      endMinute,
      startPercent: (stage.startMinute / SCENARIO_DURATION_MINUTES) * 100,
      widthPercent: ((endMinute - stage.startMinute) / SCENARIO_DURATION_MINUTES) * 100,
      status:
        stage.id === activeStage.id
          ? "current"
          : stage.startMinute < activeStage.startMinute
            ? "complete"
            : "future",
      timestamp: formatTimelineTime(stage.startMinute)
    };
  });

  return {
    elapsedMinutes: elapsed,
    progressPercent: (elapsed / SCENARIO_DURATION_MINUTES) * 100,
    activeStage,
    currentSample,
    samples,
    segments,
    sampleCount: samples.length,
    startTime: formatTimelineTime(0),
    endTime: formatTimelineTime(SCENARIO_DURATION_MINUTES)
  };
}
