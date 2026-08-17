export const PM01_MATERIAL_IDS = [
  "RM-A",
  "RM-B",
  "RM-C",
  "CATALYST",
  "PROCESS-WATER",
  "ASC-100"
] as const;

export type Pm01MaterialId = (typeof PM01_MATERIAL_IDS)[number];
export type Pm01MaterialVector = Readonly<Record<Pm01MaterialId, number>>;

export const PM01_PROCESS_STAGE_IDS = [
  "receiving",
  "raw-material-storage",
  "feed-preparation",
  "reaction",
  "separation",
  "finishing",
  "intermediate-storage",
  "released-product-storage",
  "packaging",
  "finished-goods-storage"
] as const;

export type Pm01ProcessStageId = (typeof PM01_PROCESS_STAGE_IDS)[number];

export type Pm01StageInventory = Readonly<{
  stageId: Pm01ProcessStageId;
  material: Pm01MaterialVector;
  capacityTonnes: number;
}>;

export type Pm01MaterialLedger = Readonly<{
  openingInventoryTonnes: number;
  receivedTonnes: number;
  dispatchedTonnes: number;
  processLossTonnes: number;
}>;

export type Pm01ProcessState = Readonly<{
  elapsedSeconds: number;
  stages: Readonly<Record<Pm01ProcessStageId, Pm01StageInventory>>;
  ledger: Pm01MaterialLedger;
  lastTick: Readonly<{
    feedPreparedMaterial: Pm01MaterialVector;
    feedPreparedTonnes: number;
    reactorProductTonnes: number;
    reactionLossTonnes: number;
    separatedTonnes: number;
    separationLossTonnes: number;
    finishedTonnes: number;
    finishingLossTonnes: number;
    packagedTonnes: number;
    dispatchedTonnes: number;
    processLossTonnes: number;
  }>;
}>;

/** Future faults constrain physical operations through these inputs, never through KPI overrides. */
export type Pm01ProcessConstraints = Readonly<{
  feedAvailability: number;
  reactorCapacityFactor: number;
  separationCapacityFactor: number;
  finishingCapacityFactor: number;
  packagingCapacityFactor: number;
  dispatchDemandFactor: number;
}>;

export type Pm01MaterialBalance = Readonly<{
  expectedTonnes: number;
  accountedTonnes: number;
  imbalanceTonnes: number;
  isBalanced: boolean;
}>;
