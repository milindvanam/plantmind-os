import type { Pm01MaterialId, Pm01MaterialVector, Pm01ProcessConstraints } from "./material";
import type { Pm01RunCommand, Pm01SimulationRun } from "./simulation";

export type Pm01BatchQualityState = "PENDING" | "PASS" | "HOLD" | "FAIL";
export type Pm01BatchState = "ACTIVE" | "COMPLETED";

export type Pm01BatchMaterialLot = Readonly<{
  materialId: Exclude<Pm01MaterialId, "ASC-100">;
  lotId: string;
  consumedTonnes: number;
}>;

export type Pm01ProductionBatch = Readonly<{
  id: string;
  product: "ASC-100";
  state: Pm01BatchState;
  plannedQuantityTonnes: number;
  actualQuantityTonnes: number;
  startedAt: string;
  expectedCompletionAt: string;
  completedAt: string | null;
  rawMaterialLots: readonly Pm01BatchMaterialLot[];
  rawMaterialConsumption: Pm01MaterialVector;
  processConstraints: Pm01ProcessConstraints;
  yield: number | null;
  qualityState: Pm01BatchQualityState;
}>;

export type Pm01ProductionConfiguration = Readonly<{
  designCapacityTonnesPerDay: number;
  dailyTargetTonnes: number;
  batchTargetTonnes: number;
  historySampleSeconds: number;
}>;

export type Pm01Oee = Readonly<{
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}>;

export type Pm01ProductionMetrics = Readonly<{
  designCapacityTonnesPerDay: number;
  dailyTargetTonnes: number;
  shiftTargetTonnes: number;
  currentDayActualTonnes: number;
  currentShiftActualTonnes: number;
  cumulativeActualTonnes: number;
  targetAchievement: number;
  productionVarianceTonnes: number;
  capacityUtilization: number;
  currentProductionRateTonnesPerDay: number;
  projectedEndOfDayTonnes: number | null;
  plannedOperatingSeconds: number;
  actualOperatingSeconds: number;
  grossFinishingInputTonnes: number;
  qualityAcceptedTonnes: number;
  oee: Pm01Oee;
}>;

export type Pm01ProductionHistoryPoint = Readonly<{
  timestamp: string;
  dailyActualTonnes: number;
  shiftActualTonnes: number;
  productionRateTonnesPerDay: number;
  targetAchievement: number;
  oee: number;
}>;

export type Pm01FactoryCommand = Pm01RunCommand;
export type Pm01FactoryRun = Pm01SimulationRun;
