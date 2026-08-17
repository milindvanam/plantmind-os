import { describe, expect, it } from "vitest";
import { materialVector } from "@/features/pm01/plant-reality/material-vector";
import {
  advanceProcessByTicks,
  advanceProcessState,
  calculateMaterialBalance,
  createInitialProcessState,
  getDerivedFactoryOutput,
  PM01_HEALTHY_PROCESS_CONSTRAINTS,
  receiveMaterial
} from "@/features/pm01/plant-reality/process-model";

const STEP_SECONDS = 10;
const DAY_TICKS = 8_640;

describe("PM-01 deterministic factory process", () => {
  it("replays the same initial state and steps exactly", () => {
    const first = advanceProcessByTicks(createInitialProcessState(), DAY_TICKS, STEP_SECONDS);
    const replay = advanceProcessByTicks(createInitialProcessState(), DAY_TICKS, STEP_SECONDS);
    expect(replay).toEqual(first);
  });

  it("conserves all opening, received, dispatched and lost material", () => {
    let state = createInitialProcessState();
    state = receiveMaterial(state, materialVector({ "RM-A": 20, "RM-B": 10 }));
    state = advanceProcessByTicks(state, DAY_TICKS * 3, STEP_SECONDS);
    const balance = calculateMaterialBalance(state);
    expect(balance.isBalanced).toBe(true);
    expect(Math.abs(balance.imbalanceTonnes)).toBeLessThan(1e-7);
  });

  it("derives dispatch from connected process state", () => {
    const initial = createInitialProcessState();
    const minuteTicks = 1_440 * 4;
    const healthy = advanceProcessByTicks(initial, minuteTicks, 60);
    const constrained = advanceProcessByTicks(initial, minuteTicks, 60, {
      ...PM01_HEALTHY_PROCESS_CONSTRAINTS,
      reactorCapacityFactor: 0.5
    });
    expect(getDerivedFactoryOutput(healthy).dispatchedTonnes).toBeCloseTo(400, 6);
    expect(getDerivedFactoryOutput(constrained).dispatchedTonnes).toBeLessThan(
      getDerivedFactoryOutput(healthy).dispatchedTonnes
    );
    expect(constrained.stages["finished-goods-storage"].material["ASC-100"]).toBeLessThan(0.05);
  });

  it("moves material through every factory stage", () => {
    const state = advanceProcessState(createInitialProcessState(), STEP_SECONDS);
    expect(state.lastTick.feedPreparedTonnes).toBeGreaterThan(0);
    expect(state.lastTick.reactorProductTonnes).toBeGreaterThan(0);
    expect(state.lastTick.separatedTonnes).toBeGreaterThan(0);
    expect(state.lastTick.finishedTonnes).toBeGreaterThan(0);
    expect(state.lastTick.packagedTonnes).toBeGreaterThan(0);
    expect(state.lastTick.dispatchedTonnes).toBeGreaterThan(0);
  });

  it("cannot dispatch or package material when downstream inventories are empty", () => {
    const initial = createInitialProcessState();
    const emptyDownstream = {
      ...initial,
      stages: {
        ...initial.stages,
        packaging: { ...initial.stages.packaging, material: materialVector() },
        "finished-goods-storage": {
          ...initial.stages["finished-goods-storage"],
          material: materialVector()
        }
      }
    };
    const next = advanceProcessState(emptyDownstream, STEP_SECONDS);
    expect(next.lastTick.dispatchedTonnes).toBe(0);
    expect(next.lastTick.packagedTonnes).toBe(0);
  });

  it("admits new mass only through explicit receipts", () => {
    const initial = createInitialProcessState();
    const receipt = materialVector({ "RM-C": 12 });
    const received = receiveMaterial(initial, receipt);
    expect(received.ledger.receivedTonnes).toBe(12);
    expect(calculateMaterialBalance(received).isBalanced).toBe(true);
  });
});
