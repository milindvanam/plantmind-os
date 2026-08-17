import type {
  Pm01RunCommand,
  Pm01RunConfiguration,
  Pm01SimulationClock,
  Pm01SimulationRun
} from "../contracts/simulation";
import { createSimulationClock, setClockSpeed, validateRunConfiguration } from "./simulation-clock";

export const PM01_HEALTHY_BASELINE_CONFIG: Pm01RunConfiguration = {
  scenarioId: "PM01-HEALTHY-BASELINE",
  seed: "PM01-BASELINE-001",
  startTimestamp: "2026-01-01T00:30:00.000Z",
  simulationStepSeconds: 10,
  durationDays: 7,
  initialSpeed: 1
};

export function createSimulationRun(
  runId: string,
  configuration: Pm01RunConfiguration
): Pm01SimulationRun {
  if (runId.trim().length === 0) throw new Error("PM-01 run ID cannot be empty");
  validateRunConfiguration(configuration);
  const clock = createSimulationClock(configuration);
  return {
    id: runId,
    configuration: { ...configuration, startTimestamp: clock.startTimestamp },
    clock,
    maximumTick: Math.floor((configuration.durationDays * 86_400_000) / clock.stepMilliseconds),
    version: 1
  };
}

export function applyRunCommand(run: Pm01SimulationRun, command: Pm01RunCommand) {
  let clock: Pm01SimulationClock;
  switch (command.type) {
    case "PLAY":
      clock = run.clock.status === "COMPLETED" ? run.clock : { ...run.clock, status: "RUNNING" };
      break;
    case "PAUSE":
      clock = run.clock.status === "COMPLETED" ? run.clock : { ...run.clock, status: "PAUSED" };
      break;
    case "SET_SPEED":
      clock = setClockSpeed(run.clock, command.speed);
      break;
    case "RESET":
      clock = createSimulationClock(run.configuration);
      break;
  }
  return { ...run, clock, version: run.version + 1 } satisfies Pm01SimulationRun;
}

export function advanceRunByTicks(run: Pm01SimulationRun, requestedTicks: number) {
  if (!Number.isInteger(requestedTicks) || requestedTicks < 0)
    throw new Error("PM-01 tick advance must be a non-negative integer");
  if (run.clock.status !== "RUNNING" || requestedTicks === 0) return run;
  const tick = Math.min(run.maximumTick, run.clock.tick + requestedTicks);
  const status = tick >= run.maximumTick ? "COMPLETED" : "RUNNING";
  return {
    ...run,
    clock: { ...run.clock, tick, status },
    version: run.version + 1
  } satisfies Pm01SimulationRun;
}

export function advanceRunByRealMilliseconds(
  run: Pm01SimulationRun,
  elapsedRealMilliseconds: number
) {
  if (!Number.isInteger(elapsedRealMilliseconds) || elapsedRealMilliseconds < 0)
    throw new Error("PM-01 elapsed real time must be a non-negative integer in milliseconds");
  if (run.clock.status !== "RUNNING" || elapsedRealMilliseconds === 0) return run;

  const scaledMilliseconds =
    elapsedRealMilliseconds * run.clock.speed + run.clock.realTimeRemainderMilliseconds;
  const ticks = Math.floor(scaledMilliseconds / run.clock.stepMilliseconds);
  const remainder = scaledMilliseconds % run.clock.stepMilliseconds;
  if (ticks === 0)
    return {
      ...run,
      clock: { ...run.clock, realTimeRemainderMilliseconds: remainder }
    } satisfies Pm01SimulationRun;

  const advanced = advanceRunByTicks(run, ticks);
  return {
    ...advanced,
    clock: {
      ...advanced.clock,
      realTimeRemainderMilliseconds: advanced.clock.status === "COMPLETED" ? 0 : remainder
    }
  } satisfies Pm01SimulationRun;
}
