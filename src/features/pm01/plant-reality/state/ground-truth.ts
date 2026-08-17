import "server-only";

declare const groundTruthBrand: unique symbol;

/** Simulator-owned state. It must never be used in an observable or PlantMind contract. */
export type Pm01GroundTruth = Readonly<{
  [groundTruthBrand]: true;
  hx301FoulingIndex: number;
  p301aBearingHealth: number;
  cv301StictionCoefficient: number;
  filterLoading: number;
  rawMaterialReactivity: number;
  sensorBiasByTag: Readonly<Record<string, number>>;
}>;
