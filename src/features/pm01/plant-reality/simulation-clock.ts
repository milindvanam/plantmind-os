import {
  PM01_SIMULATION_SPEEDS,
  type Pm01RunConfiguration,
  type Pm01SimulationClock,
  type Pm01SimulationSpeed
} from "../contracts/simulation";

const DAY_MILLISECONDS = 86_400_000;
const SITE_TIME_ZONE = "Asia/Kolkata";

export function validateRunConfiguration(configuration: Pm01RunConfiguration) {
  const start = Date.parse(configuration.startTimestamp);
  if (!Number.isFinite(start)) throw new Error("PM-01 start timestamp must be valid ISO-8601");
  if (configuration.seed.trim().length === 0)
    throw new Error("PM-01 simulation seed cannot be empty");
  if (
    !Number.isInteger(configuration.simulationStepSeconds) ||
    configuration.simulationStepSeconds <= 0
  )
    throw new Error("PM-01 simulation step must be a positive whole number of seconds");
  if (!Number.isInteger(configuration.durationDays) || configuration.durationDays <= 0)
    throw new Error("PM-01 duration must be a positive whole number of days");
  if (!PM01_SIMULATION_SPEEDS.includes(configuration.initialSpeed))
    throw new Error("PM-01 initial speed is unsupported");
  return configuration;
}

export function createSimulationClock(configuration: Pm01RunConfiguration): Pm01SimulationClock {
  validateRunConfiguration(configuration);
  return {
    startTimestamp: new Date(configuration.startTimestamp).toISOString(),
    tick: 0,
    stepMilliseconds: configuration.simulationStepSeconds * 1000,
    speed: configuration.initialSpeed,
    status: "CREATED",
    realTimeRemainderMilliseconds: 0
  };
}

export function setClockSpeed(clock: Pm01SimulationClock, speed: Pm01SimulationSpeed) {
  if (!PM01_SIMULATION_SPEEDS.includes(speed)) throw new Error(`Unsupported PM-01 speed: ${speed}`);
  return { ...clock, speed } satisfies Pm01SimulationClock;
}

export function getSimulatedTimestamp(clock: Pm01SimulationClock) {
  return new Date(
    Date.parse(clock.startTimestamp) + clock.tick * clock.stepMilliseconds
  ).toISOString();
}

export function getElapsedSimulationSeconds(clock: Pm01SimulationClock) {
  return (clock.tick * clock.stepMilliseconds) / 1000;
}

export function getProductionDay(clock: Pm01SimulationClock) {
  return Math.floor((clock.tick * clock.stepMilliseconds) / DAY_MILLISECONDS) + 1;
}

export function getCurrentShift(clock: Pm01SimulationClock): "A" | "B" | "C" {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: SITE_TIME_ZONE
  }).formatToParts(new Date(getSimulatedTimestamp(clock)));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  if (hour >= 6 && hour < 14) return "A";
  if (hour >= 14 && hour < 22) return "B";
  return "C";
}
