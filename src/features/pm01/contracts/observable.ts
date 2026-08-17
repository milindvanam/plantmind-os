import type { Pm01AssetDefinition, Pm01AssetState } from "./asset";
import type { Pm01SimulationSpeed, Pm01RunStatus } from "./simulation";
import type { Pm01ObservableTagValue, Pm01TagDefinition } from "./tag";

export type Pm01ObservableRunSnapshot = Readonly<{
  runId: string;
  scenarioId: string;
  simulatedTimestamp: string;
  elapsedSimulationSeconds: number;
  currentShift: "A" | "B" | "C";
  productionDay: number;
  speed: Pm01SimulationSpeed;
  status: Pm01RunStatus;
}>;

export type Pm01ObservableFactorySnapshot = Readonly<{
  run: Pm01ObservableRunSnapshot;
  assets: readonly Pm01AssetDefinition[];
  assetStates: readonly Pm01AssetState[];
  tags: readonly Pm01TagDefinition[];
  values: readonly Pm01ObservableTagValue[];
}>;
