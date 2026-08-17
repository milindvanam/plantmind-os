import { describe, expect, it } from "vitest";
import { createDeterministicRng } from "@/features/pm01/plant-reality/deterministic-rng";

describe("PM-01 deterministic RNG", () => {
  it("reproduces an identical stream from the same seed and namespace", () => {
    const first = createDeterministicRng("PM01-BASELINE-001", "HX-301");
    const second = createDeterministicRng("PM01-BASELINE-001", "HX-301");
    expect(Array.from({ length: 20 }, () => first.nextUint32())).toEqual(
      Array.from({ length: 20 }, () => second.nextUint32())
    );
  });

  it("isolates streams by subsystem namespace", () => {
    const exchanger = createDeterministicRng("PM01-BASELINE-001", "HX-301");
    const reactor = createDeterministicRng("PM01-BASELINE-001", "R-301");
    expect(exchanger.nextUint32()).not.toBe(reactor.nextUint32());
  });

  it("produces bounded floating-point and integer values", () => {
    const rng = createDeterministicRng("seed", "test");
    for (let index = 0; index < 100; index += 1) {
      expect(rng.between(-2, 2)).toBeGreaterThanOrEqual(-2);
      expect(rng.integer(3, 7)).toBeGreaterThanOrEqual(3);
      expect(rng.integer(3, 7)).toBeLessThanOrEqual(7);
    }
  });
});
