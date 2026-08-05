import { describe, expect, it } from "vitest";
import {
  formatSimulatedTime,
  getStageAt,
  initialReplayState,
  progressReplay,
  sampleAt,
  SCENARIO_DURATION_MINUTES,
  SCENARIO_STAGES
} from "@/lib/scenario";

describe("deterministic scenario model", () => {
  it("maps every approved stage boundary exactly", () => {
    for (const stage of SCENARIO_STAGES) expect(getStageAt(stage.startMinute).id).toBe(stage.id);
  });
  it("progresses only while running and completes at eight hours", () => {
    const idle = initialReplayState();
    expect(progressReplay(idle, 10)).toEqual(idle);
    const running = {
      ...idle,
      status: "running" as const,
      elapsedMinutes: 475,
      speed: 12 as const
    };
    const completed = progressReplay(running, 1);
    expect(completed.elapsedMinutes).toBe(SCENARIO_DURATION_MINUTES);
    expect(completed.status).toBe("complete");
  });
  it("returns repeatable samples and labels", () => {
    expect(sampleAt(240)).toEqual(sampleAt(240));
    expect(sampleAt(0).vibration).toBe(2.1);
    expect(formatSimulatedTime(0)).toContain("17 Mar 2026");
  });
  it("clamps jumps beyond the scenario bounds", () => {
    expect(getStageAt(-50).id).toBe("normal");
    expect(getStageAt(900).id).toBe("recovery");
  });
});
