import { describe, expect, it } from "vitest";
import type { Pm01MaterialId, Pm01ProcessState } from "@/features/pm01/contracts/material";
import { createEnergyConfiguration } from "@/features/pm01/plant-reality/energy-model";
import {
  advanceFactoryByRealMilliseconds,
  advanceFactoryByTicks,
  applyFactoryCommand,
  createFactoryState
} from "@/features/pm01/plant-reality/factory-model";
import { materialVector, totalMaterialTonnes } from "@/features/pm01/plant-reality/material-vector";
import {
  advanceProcessState,
  calculateMaterialBalance,
  createInitialProcessState,
  PM01_HEALTHY_PROCESS_CONSTRAINTS,
  PM01_PACKAGING_CAPACITY_TONNES_PER_HOUR
} from "@/features/pm01/plant-reality/process-model";
import { calculateOee } from "@/features/pm01/plant-reality/production-model";
import { PM01_HEALTHY_BASELINE_CONFIG } from "@/features/pm01/plant-reality/run-lifecycle";

const DAY_TICKS = 8_640;
const RAW_MATERIALS = ["RM-A", "RM-B", "RM-C", "CATALYST", "PROCESS-WATER"] as const;

function runningFactory(initialProcess = createInitialProcessState()) {
  return applyFactoryCommand(
    createFactoryState("run-m4", PM01_HEALTHY_BASELINE_CONFIG, { initialProcess }),
    { type: "PLAY" }
  );
}

function withoutRawSupply(): Pm01ProcessState {
  const initial = createInitialProcessState();
  const stages = {
    ...initial.stages,
    receiving: { ...initial.stages.receiving, material: materialVector() },
    "raw-material-storage": {
      ...initial.stages["raw-material-storage"],
      material: materialVector()
    },
    "feed-preparation": {
      ...initial.stages["feed-preparation"],
      material: materialVector()
    },
    reaction: { ...initial.stages.reaction, material: materialVector() }
  };
  const openingInventoryTonnes = Object.values(stages).reduce(
    (total, stage) => total + totalMaterialTonnes(stage.material),
    0
  );
  return { ...initial, stages, ledger: { ...initial.ledger, openingInventoryTonnes } };
}

function totalRawAtSource(state: Pm01ProcessState, materialId: Pm01MaterialId) {
  return (
    state.stages.receiving.material[materialId] +
    state.stages["raw-material-storage"].material[materialId]
  );
}

describe("PM-01 integrated production, batch and energy model", () => {
  it("keeps healthy production close to the 100 T/day design target", () => {
    const result = advanceFactoryByTicks(runningFactory(), DAY_TICKS);
    expect(result.production.cumulativeActualTonnes).toBeGreaterThanOrEqual(96);
    expect(result.production.cumulativeActualTonnes).toBeLessThanOrEqual(100);
    expect(result.production.capacityUtilization).toBeGreaterThanOrEqual(0.96);
    expect(result.production.currentProductionRateTonnesPerDay).toBeGreaterThanOrEqual(96);
  });

  it("reduces production when raw materials are unavailable", () => {
    const healthy = advanceFactoryByTicks(runningFactory(), DAY_TICKS);
    const starved = advanceFactoryByTicks(runningFactory(withoutRawSupply()), DAY_TICKS);
    expect(starved.production.cumulativeActualTonnes).toBeLessThan(
      healthy.production.cumulativeActualTonnes * 0.5
    );
    expect(starved.production.currentProductionRateTonnesPerDay).toBe(0);
  });

  it("enforces the physical packaging capacity of 5 T/hour", () => {
    const process = advanceProcessState(createInitialProcessState(), 3_600);
    expect(PM01_PACKAGING_CAPACITY_TONNES_PER_HOUR).toBe(5);
    expect(process.lastTick.packagedTonnes).toBeLessThanOrEqual(5);
    const constrained = advanceProcessState(createInitialProcessState(), 3_600, {
      ...PM01_HEALTHY_PROCESS_CONSTRAINTS,
      packagingCapacityFactor: 0.5
    });
    expect(constrained.lastTick.packagedTonnes).toBeLessThanOrEqual(2.5);
  });

  it("reconciles batch raw-material consumption to source inventory", () => {
    const initial = createInitialProcessState();
    const result = advanceFactoryByTicks(runningFactory(initial), DAY_TICKS);
    for (const materialId of RAW_MATERIALS) {
      const consumedByBatches = result.batches.reduce(
        (total, batch) => total + batch.rawMaterialConsumption[materialId],
        0
      );
      const sourceReduction =
        totalRawAtSource(initial, materialId) - totalRawAtSource(result.process, materialId);
      expect(consumedByBatches).toBeCloseTo(sourceReduction, 8);
    }
    expect(result.batches.some((batch) => batch.state === "COMPLETED")).toBe(true);
    expect(result.batches.every((batch) => batch.rawMaterialLots.length === 5)).toBe(true);
  });

  it("reconciles yield, defined losses and the complete material balance", () => {
    const result = advanceFactoryByTicks(runningFactory(), DAY_TICKS);
    expect(calculateMaterialBalance(result.process).isBalanced).toBe(true);
    expect(result.process.ledger.processLossTonnes).toBeGreaterThan(0);
    for (const batch of result.batches) {
      if (batch.yield !== null) {
        expect(batch.yield).toBeCloseTo(
          batch.actualQuantityTonnes / totalMaterialTonnes(batch.rawMaterialConsumption),
          10
        );
      }
    }
  });

  it("derives every OEE component and the final OEE", () => {
    const result = advanceFactoryByTicks(runningFactory(), DAY_TICKS);
    const expected = calculateOee(result.productionAccumulator);
    expect(result.production.oee).toEqual(expected);
    expect(result.production.oee.availability).toBeCloseTo(
      result.production.actualOperatingSeconds / result.production.plannedOperatingSeconds,
      10
    );
    expect(result.production.oee.quality).toBeCloseTo(
      result.production.qualityAcceptedTonnes / result.production.grossFinishingInputTonnes,
      10
    );
    expect(result.production.oee.oee).toBeCloseTo(
      result.production.oee.availability *
        result.production.oee.performance *
        result.production.oee.quality,
      10
    );
  });

  it("keeps healthy energy near its configurable baseline and penalizes low load", () => {
    const energyConfiguration = createEnergyConfiguration({
      healthyBaselineKwhEquivalentPerTonne: 410
    });
    const healthy = advanceFactoryByTicks(
      applyFactoryCommand(
        createFactoryState("energy-healthy", PM01_HEALTHY_BASELINE_CONFIG, {
          energyConfiguration
        }),
        { type: "PLAY" }
      ),
      DAY_TICKS
    );
    const lowLoad = advanceFactoryByTicks(
      applyFactoryCommand(
        createFactoryState("energy-low", PM01_HEALTHY_BASELINE_CONFIG, {
          energyConfiguration,
          processConstraints: {
            ...PM01_HEALTHY_PROCESS_CONSTRAINTS,
            feedAvailability: 0.5,
            reactorCapacityFactor: 0.5,
            separationCapacityFactor: 0.5,
            finishingCapacityFactor: 0.5,
            packagingCapacityFactor: 0.5
          }
        }),
        { type: "PLAY" }
      ),
      DAY_TICKS
    );
    expect(healthy.energy.energyPerTonne).toBeGreaterThan(400);
    expect(healthy.energy.energyPerTonne).toBeLessThan(425);
    expect(lowLoad.energy.energyPerTonne).toBeGreaterThan(healthy.energy.energyPerTonne ?? 0);
  });

  it("pauses, resets and exactly replays production and energy", () => {
    let state = runningFactory();
    state = advanceFactoryByRealMilliseconds(state, 10_000);
    const paused = applyFactoryCommand(state, { type: "PAUSE" });
    expect(advanceFactoryByRealMilliseconds(paused, 10_000)).toBe(paused);
    const first = advanceFactoryByTicks(applyFactoryCommand(paused, { type: "PLAY" }), 500);
    const reset = applyFactoryCommand(first, { type: "RESET" });
    const replay = advanceFactoryByTicks(applyFactoryCommand(reset, { type: "PLAY" }), 501);
    expect(replay.process).toEqual(first.process);
    expect(replay.production).toEqual(first.production);
    expect(replay.energy).toEqual(first.energy);
    expect(replay.batches).toEqual(first.batches);
  });

  it("records deterministic downsampled production and energy histories", () => {
    const result = advanceFactoryByTicks(runningFactory(), 3_600 / 10);
    expect(result.productionHistory).toHaveLength(12);
    expect(result.energyHistory).toHaveLength(12);
    expect(result.productionHistory.at(-1)?.timestamp).toBe(result.energyHistory.at(-1)?.timestamp);
    expect(result.production.projectedEndOfDayTonnes).not.toBeNull();
  });
});
