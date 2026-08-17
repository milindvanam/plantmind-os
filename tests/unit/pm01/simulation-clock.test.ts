import { describe, expect, it } from "vitest";
import {
  createSimulationClock,
  getCurrentShift,
  getProductionDay,
  getSimulatedTimestamp
} from "@/features/pm01/plant-reality/simulation-clock";
import { PM01_HEALTHY_BASELINE_CONFIG } from "@/features/pm01/plant-reality/run-lifecycle";

describe("PM-01 simulation clock", () => {
  it("derives simulation time without reading wall-clock time", () => {
    const clock = createSimulationClock(PM01_HEALTHY_BASELINE_CONFIG);
    expect(getSimulatedTimestamp(clock)).toBe("2026-01-01T00:30:00.000Z");
    expect(getCurrentShift(clock)).toBe("A");
    expect(getProductionDay(clock)).toBe(1);
    expect(getSimulatedTimestamp({ ...clock, tick: 8640 })).toBe("2026-01-02T00:30:00.000Z");
    expect(getProductionDay({ ...clock, tick: 8640 })).toBe(2);
  });

  it("rejects invalid run configurations", () => {
    expect(() =>
      createSimulationClock({ ...PM01_HEALTHY_BASELINE_CONFIG, simulationStepSeconds: 0 })
    ).toThrow("simulation step");
    expect(() => createSimulationClock({ ...PM01_HEALTHY_BASELINE_CONFIG, seed: "" })).toThrow(
      "seed cannot be empty"
    );
  });
});
