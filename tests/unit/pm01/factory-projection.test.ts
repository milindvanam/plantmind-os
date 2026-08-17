import { describe, expect, it } from "vitest";
import {
  advanceFactoryByTicks,
  applyFactoryCommand,
  createFactoryState
} from "@/features/pm01/plant-reality/factory-model";
import { totalMaterialTonnes } from "@/features/pm01/plant-reality/material-vector";
import { PM01_HEALTHY_BASELINE_CONFIG } from "@/features/pm01/plant-reality/run-lifecycle";
import { projectFactoryView } from "@/features/pm01/observable/factory-projection";

function runningFactory() {
  return applyFactoryCommand(createFactoryState("projection-test", PM01_HEALTHY_BASELINE_CONFIG), {
    type: "PLAY"
  });
}

describe("PM-01 safe factory visualization projection", () => {
  it("derives production, OEE and energy from the integrated factory model", () => {
    const factory = advanceFactoryByTicks(runningFactory(), 360);
    const view = projectFactoryView(factory);
    expect(view.kpis.productionTodayTonnes).toBe(factory.production.currentDayActualTonnes);
    expect(view.kpis.oee).toEqual(factory.production.oee);
    expect(view.kpis.energyPerTonne).toBe(factory.energy.energyPerTonne);
    expect(view.kpis.expectedByNowTonnes).toBeCloseTo(
      factory.production.currentDayActualTonnes - factory.production.productionVarianceTonnes,
      10
    );
  });

  it("reconciles visible raw inventory with receiving and storage", () => {
    const factory = advanceFactoryByTicks(runningFactory(), 360);
    const view = projectFactoryView(factory);
    for (const inventory of view.inventories) {
      expect(inventory.tonnes).toBeCloseTo(
        factory.process.stages.receiving.material[inventory.materialId] +
          factory.process.stages["raw-material-storage"].material[inventory.materialId],
        10
      );
    }
    expect(view.processNodes.find((node) => node.id === "reaction")?.inventoryTonnes).toBeCloseTo(
      totalMaterialTonnes(factory.process.stages.reaction.material),
      10
    );
  });

  it("contains every major process stage and no hidden ground truth", () => {
    const view = projectFactoryView(runningFactory());
    expect(view.processNodes.map((node) => node.title)).toEqual([
      "Receiving",
      "Tank farm",
      "Feed preparation",
      "Reaction",
      "Separation",
      "Finishing",
      "Quality release",
      "Packaging",
      "Finished goods",
      "Dispatch"
    ]);
    const serialized = JSON.stringify(view);
    for (const forbidden of [
      "hx301FoulingIndex",
      "p301aBearingHealth",
      "cv301StictionCoefficient",
      "filterLoading",
      "rawMaterialReactivity",
      "sensorBiasByTag"
    ])
      expect(serialized).not.toContain(forbidden);
  });
});
