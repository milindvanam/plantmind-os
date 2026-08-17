export const PM01_SIMULATION_SPEEDS = [1, 10, 100, 1000] as const;
export type Pm01SimulationSpeed = (typeof PM01_SIMULATION_SPEEDS)[number];
export type Pm01RunStatus = "CREATED" | "RUNNING" | "PAUSED" | "COMPLETED";

export type Pm01RunConfiguration = Readonly<{
  scenarioId: "PM01-HEALTHY-BASELINE" | "PM-S01-HX301-FOULING";
  seed: string;
  startTimestamp: string;
  simulationStepSeconds: number;
  durationDays: number;
  initialSpeed: Pm01SimulationSpeed;
}>;

export type Pm01SimulationClock = Readonly<{
  startTimestamp: string;
  tick: number;
  stepMilliseconds: number;
  speed: Pm01SimulationSpeed;
  status: Pm01RunStatus;
  realTimeRemainderMilliseconds: number;
}>;

export type Pm01SimulationRun = Readonly<{
  id: string;
  configuration: Pm01RunConfiguration;
  clock: Pm01SimulationClock;
  maximumTick: number;
  version: number;
}>;

export type Pm01RunCommand =
  | Readonly<{ type: "PLAY" }>
  | Readonly<{ type: "PAUSE" }>
  | Readonly<{ type: "RESET" }>
  | Readonly<{ type: "SET_SPEED"; speed: Pm01SimulationSpeed }>;
