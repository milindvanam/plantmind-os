// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("PM-01 architectural boundaries", () => {
  it("marks hidden ground truth as server-only", () => {
    const source = read("src/features/pm01/plant-reality/state/ground-truth.ts");
    expect(source).toContain('import "server-only"');
    expect(source).toContain("Pm01GroundTruth");
  });

  it("keeps every ground-truth field out of observable contracts", () => {
    const observable = read("src/features/pm01/contracts/observable.ts");
    for (const forbidden of [
      "hx301FoulingIndex",
      "p301aBearingHealth",
      "cv301StictionCoefficient",
      "filterLoading",
      "rawMaterialReactivity",
      "sensorBiasByTag"
    ])
      expect(observable).not.toContain(forbidden);
  });

  it("keeps the material-flow model independent of ground truth and PlantMind", () => {
    const source = read("src/features/pm01/plant-reality/process-model.ts");
    expect(source).not.toContain("ground-truth");
    expect(source).not.toContain("Pm01GroundTruth");
    expect(source).not.toContain("plantmind/");
  });

  it("keeps production, batch and energy models isolated from hidden ground truth", () => {
    for (const file of [
      "src/features/pm01/contracts/production.ts",
      "src/features/pm01/contracts/energy.ts",
      "src/features/pm01/plant-reality/production-model.ts",
      "src/features/pm01/plant-reality/energy-model.ts",
      "src/features/pm01/plant-reality/factory-model.ts"
    ]) {
      const source = read(file);
      expect(source).not.toContain("ground-truth");
      expect(source).not.toContain("Pm01GroundTruth");
      expect(source).not.toContain("hx301FoulingIndex");
    }
  });

  it("keeps visualization UI behind application and observable boundaries", () => {
    const ui = read("src/features/pm01/ui/virtual-factory.tsx");
    const twin = read("src/features/pm01/ui/plant-3d-view.tsx");
    expect(ui).not.toContain("plant-reality");
    expect(ui).not.toContain("ground-truth");
    expect(twin).not.toContain("plant-reality");
    expect(twin).not.toContain("ground-truth");
    expect(twin).toContain("Pm01FactoryView");
    const projection = read("src/features/pm01/observable/factory-projection.ts");
    const controller = read("src/features/pm01/application/use-factory-simulation.ts");
    for (const source of [projection, controller]) {
      expect(source).not.toContain("ground-truth");
      expect(source).not.toContain("Pm01GroundTruth");
      expect(source).not.toContain("hx301FoulingIndex");
    }
  });

  it("does not couple PM-01 to the legacy P-204A scenario engine", () => {
    const files = [
      "src/features/pm01/plant-reality/asset-registry.ts",
      "src/features/pm01/plant-reality/tag-registry.ts",
      "src/features/pm01/plant-reality/deterministic-rng.ts",
      "src/features/pm01/plant-reality/simulation-clock.ts",
      "src/features/pm01/plant-reality/run-lifecycle.ts",
      "src/features/pm01/plant-reality/material-vector.ts",
      "src/features/pm01/plant-reality/process-model.ts",
      "src/features/pm01/plant-reality/production-model.ts",
      "src/features/pm01/plant-reality/energy-model.ts",
      "src/features/pm01/plant-reality/factory-model.ts"
    ];
    for (const file of files) {
      const source = read(file);
      expect(source).not.toContain("@/lib/scenario");
      expect(source).not.toContain("ScenarioProvider");
      expect(source).not.toContain("P-204A");
    }
  });

  it("keeps nondeterministic wall-clock and random APIs out of the simulation foundation", () => {
    const files = [
      "src/features/pm01/plant-reality/deterministic-rng.ts",
      "src/features/pm01/plant-reality/simulation-clock.ts",
      "src/features/pm01/plant-reality/run-lifecycle.ts",
      "src/features/pm01/plant-reality/material-vector.ts",
      "src/features/pm01/plant-reality/process-model.ts",
      "src/features/pm01/plant-reality/production-model.ts",
      "src/features/pm01/plant-reality/energy-model.ts",
      "src/features/pm01/plant-reality/factory-model.ts"
    ];
    for (const file of files) {
      const source = read(file);
      expect(source).not.toContain("Math.random(");
      expect(source).not.toContain("Date.now(");
      expect(source).not.toContain("new Date()");
    }
  });
});
