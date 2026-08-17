import { describe, expect, it } from "vitest";
import type { Pm01SimulationRun } from "@/features/pm01/contracts/simulation";
import {
  advanceRunByRealMilliseconds,
  advanceRunByTicks,
  applyRunCommand,
  createSimulationRun,
  PM01_HEALTHY_BASELINE_CONFIG
} from "@/features/pm01/plant-reality/run-lifecycle";

describe("PM-01 run lifecycle", () => {
  it("does not advance until explicitly played", () => {
    const created = createSimulationRun("run-001", PM01_HEALTHY_BASELINE_CONFIG);
    expect(advanceRunByTicks(created, 50)).toBe(created);
    const running = applyRunCommand(created, { type: "PLAY" });
    expect(advanceRunByTicks(running, 50).clock.tick).toBe(50);
  });

  it("is invariant to real-time chunking", () => {
    const initial = applyRunCommand(createSimulationRun("run-001", PM01_HEALTHY_BASELINE_CONFIG), {
      type: "PLAY"
    });
    const once = advanceRunByRealMilliseconds(initial, 25_000);
    const chunked = Array.from({ length: 25 }).reduce<Pm01SimulationRun>(
      (run) => advanceRunByRealMilliseconds(run, 1000),
      initial
    );
    expect(chunked.clock).toEqual(once.clock);
  });

  it("supports approved speeds, pause and exact reset", () => {
    let run = createSimulationRun("run-001", PM01_HEALTHY_BASELINE_CONFIG);
    run = applyRunCommand(run, { type: "SET_SPEED", speed: 1000 });
    run = applyRunCommand(run, { type: "PLAY" });
    run = advanceRunByRealMilliseconds(run, 1000);
    expect(run.clock.tick).toBe(100);
    run = applyRunCommand(run, { type: "PAUSE" });
    expect(advanceRunByRealMilliseconds(run, 1000)).toBe(run);
    run = applyRunCommand(run, { type: "RESET" });
    expect(run.clock.tick).toBe(0);
    expect(run.clock.status).toBe("CREATED");
    expect(run.clock.speed).toBe(PM01_HEALTHY_BASELINE_CONFIG.initialSpeed);
  });

  it("completes exactly at the configured horizon", () => {
    let run = applyRunCommand(
      createSimulationRun("run-001", { ...PM01_HEALTHY_BASELINE_CONFIG, durationDays: 1 }),
      { type: "PLAY" }
    );
    run = advanceRunByTicks(run, run.maximumTick + 100);
    expect(run.clock.tick).toBe(run.maximumTick);
    expect(run.clock.status).toBe("COMPLETED");
  });
});
