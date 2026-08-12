import { describe, expect, it } from "vitest";
import {
  assessHydraulicCycle,
  getHydraulicCycle,
  getHydraulicManifest,
  getHydraulicReplay
} from "@/features/real-data/hydraulic-adapter";

describe("UCI hydraulic telemetry adapter", () => {
  it("loads every source cycle with verified provenance and canonical statistics", () => {
    const manifest = getHydraulicManifest();
    expect(manifest.cycles).toHaveLength(2205);
    expect(manifest.source.doi).toBe("10.24432/C5CW21");
    expect(manifest.source.license).toBe("CC BY 4.0");
    expect(manifest.source.archiveSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.context.simulated).toBe(true);
    expect(manifest.sensors).toHaveLength(17);
    expect(getHydraulicCycle(1).sensors.PS1!.samples).toBe(6000);
    expect(getHydraulicCycle(1).sensors.VS1!.samples).toBe(60);
  });

  it("preserves source labels and creates the bounded four-stage replay", () => {
    const replay = getHydraulicReplay();
    expect(replay.map((item) => item.stage)).toEqual(["healthy", "emerging", "weak", "severe"]);
    expect(replay.map((item) => item.cycle.conditions.pumpLeakage)).toEqual([0, 0, 1, 2]);
    expect(replay.map((item) => assessHydraulicCycle(item.cycle).state)).toEqual([
      "healthy",
      "watch",
      "watch",
      "critical"
    ]);
  });

  it("fails closed when a requested cycle is outside the source dataset", () => {
    expect(() => getHydraulicCycle(2206)).toThrow("cycle 2206 is unavailable");
  });
});
