import type { Pm01MaterialVector, Pm01ProcessConstraints } from "../contracts/material";
import type {
  Pm01BatchMaterialLot,
  Pm01Oee,
  Pm01ProductionBatch,
  Pm01ProductionConfiguration,
  Pm01ProductionMetrics
} from "../contracts/production";
import { addMaterial, emptyMaterialVector, totalMaterialTonnes } from "./material-vector";

const SECONDS_PER_DAY = 86_400;
const SHIFT_SECONDS = 28_800;

export const PM01_PRODUCTION_CONFIGURATION: Pm01ProductionConfiguration = {
  designCapacityTonnesPerDay: 100,
  dailyTargetTonnes: 100,
  batchTargetTonnes: 25,
  historySampleSeconds: 300
};

export type Pm01ProductionAccumulator = Readonly<{
  cumulativeActualTonnes: number;
  actualByDay: Readonly<Record<number, number>>;
  actualByShift: Readonly<Record<number, number>>;
  plannedOperatingSeconds: number;
  actualOperatingSeconds: number;
  grossFinishingInputTonnes: number;
  qualityAcceptedTonnes: number;
}>;

export function createProductionAccumulator(): Pm01ProductionAccumulator {
  return {
    cumulativeActualTonnes: 0,
    actualByDay: {},
    actualByShift: {},
    plannedOperatingSeconds: 0,
    actualOperatingSeconds: 0,
    grossFinishingInputTonnes: 0,
    qualityAcceptedTonnes: 0
  };
}

export function accumulateProduction(
  accumulator: Pm01ProductionAccumulator,
  elapsedBeforeTickSeconds: number,
  stepSeconds: number,
  finishedTonnes: number,
  finishingLossTonnes: number,
  reactorProductTonnes: number
): Pm01ProductionAccumulator {
  const dayIndex = Math.floor(elapsedBeforeTickSeconds / SECONDS_PER_DAY);
  const shiftIndex = Math.floor(elapsedBeforeTickSeconds / SHIFT_SECONDS);
  return {
    cumulativeActualTonnes: accumulator.cumulativeActualTonnes + finishedTonnes,
    actualByDay: {
      ...accumulator.actualByDay,
      [dayIndex]: (accumulator.actualByDay[dayIndex] ?? 0) + finishedTonnes
    },
    actualByShift: {
      ...accumulator.actualByShift,
      [shiftIndex]: (accumulator.actualByShift[shiftIndex] ?? 0) + finishedTonnes
    },
    plannedOperatingSeconds: accumulator.plannedOperatingSeconds + stepSeconds,
    actualOperatingSeconds:
      accumulator.actualOperatingSeconds + (reactorProductTonnes > 0 ? stepSeconds : 0),
    grossFinishingInputTonnes:
      accumulator.grossFinishingInputTonnes + finishedTonnes + finishingLossTonnes,
    qualityAcceptedTonnes: accumulator.qualityAcceptedTonnes + finishedTonnes
  };
}

export function calculateOee(
  accumulator: Pm01ProductionAccumulator,
  configuration: Pm01ProductionConfiguration = PM01_PRODUCTION_CONFIGURATION
): Pm01Oee {
  const availability =
    accumulator.plannedOperatingSeconds === 0
      ? 0
      : accumulator.actualOperatingSeconds / accumulator.plannedOperatingSeconds;
  const idealDuringOperating =
    (accumulator.actualOperatingSeconds / SECONDS_PER_DAY) *
    configuration.designCapacityTonnesPerDay;
  const performance =
    idealDuringOperating === 0
      ? 0
      : Math.min(1, accumulator.grossFinishingInputTonnes / idealDuringOperating);
  const quality =
    accumulator.grossFinishingInputTonnes === 0
      ? 0
      : accumulator.qualityAcceptedTonnes / accumulator.grossFinishingInputTonnes;
  return { availability, performance, quality, oee: availability * performance * quality };
}

export function calculateProductionMetrics(
  accumulator: Pm01ProductionAccumulator,
  elapsedSeconds: number,
  lastTickFinishedTonnes: number,
  stepSeconds: number,
  configuration: Pm01ProductionConfiguration = PM01_PRODUCTION_CONFIGURATION
): Pm01ProductionMetrics {
  const dayIndex = Math.floor(Math.max(0, elapsedSeconds - Number.EPSILON) / SECONDS_PER_DAY);
  const shiftIndex = Math.floor(Math.max(0, elapsedSeconds - Number.EPSILON) / SHIFT_SECONDS);
  const secondsIntoDay = elapsedSeconds - dayIndex * SECONDS_PER_DAY;
  const dayActual = accumulator.actualByDay[dayIndex] ?? 0;
  const shiftActual = accumulator.actualByShift[shiftIndex] ?? 0;
  const expectedByNow = (configuration.dailyTargetTonnes * secondsIntoDay) / SECONDS_PER_DAY;
  const productionRate =
    stepSeconds === 0 ? 0 : (lastTickFinishedTonnes / stepSeconds) * SECONDS_PER_DAY;
  const projectedEndOfDayTonnes =
    secondsIntoDay === 0 || accumulator.actualOperatingSeconds === 0
      ? null
      : dayActual + productionRate * ((SECONDS_PER_DAY - secondsIntoDay) / SECONDS_PER_DAY);
  return {
    designCapacityTonnesPerDay: configuration.designCapacityTonnesPerDay,
    dailyTargetTonnes: configuration.dailyTargetTonnes,
    shiftTargetTonnes: configuration.dailyTargetTonnes / 3,
    currentDayActualTonnes: dayActual,
    currentShiftActualTonnes: shiftActual,
    cumulativeActualTonnes: accumulator.cumulativeActualTonnes,
    targetAchievement: expectedByNow === 0 ? 0 : dayActual / expectedByNow,
    productionVarianceTonnes: dayActual - expectedByNow,
    capacityUtilization:
      elapsedSeconds === 0
        ? 0
        : accumulator.cumulativeActualTonnes /
          ((elapsedSeconds / SECONDS_PER_DAY) * configuration.designCapacityTonnesPerDay),
    currentProductionRateTonnesPerDay: productionRate,
    projectedEndOfDayTonnes,
    plannedOperatingSeconds: accumulator.plannedOperatingSeconds,
    actualOperatingSeconds: accumulator.actualOperatingSeconds,
    grossFinishingInputTonnes: accumulator.grossFinishingInputTonnes,
    qualityAcceptedTonnes: accumulator.qualityAcceptedTonnes,
    oee: calculateOee(accumulator, configuration)
  };
}

function batchId(runId: string, sequence: number) {
  return `${runId}-ASC-${String(sequence).padStart(4, "0")}`;
}

function lotId(materialId: Pm01BatchMaterialLot["materialId"]) {
  return `${materialId}-OPENING-001`;
}

function batchLots(consumption: Pm01MaterialVector): readonly Pm01BatchMaterialLot[] {
  return (["RM-A", "RM-B", "RM-C", "CATALYST", "PROCESS-WATER"] as const).map((materialId) => ({
    materialId,
    lotId: lotId(materialId),
    consumedTonnes: consumption[materialId]
  }));
}

export function createProductionBatch(
  runId: string,
  sequence: number,
  timestamp: string,
  constraints: Pm01ProcessConstraints,
  configuration: Pm01ProductionConfiguration = PM01_PRODUCTION_CONFIGURATION
): Pm01ProductionBatch {
  const expectedMilliseconds =
    (configuration.batchTargetTonnes / configuration.designCapacityTonnesPerDay) *
    SECONDS_PER_DAY *
    1000;
  const consumption = emptyMaterialVector();
  return {
    id: batchId(runId, sequence),
    product: "ASC-100",
    state: "ACTIVE",
    plannedQuantityTonnes: configuration.batchTargetTonnes,
    actualQuantityTonnes: 0,
    startedAt: timestamp,
    expectedCompletionAt: new Date(Date.parse(timestamp) + expectedMilliseconds).toISOString(),
    completedAt: null,
    rawMaterialLots: batchLots(consumption),
    rawMaterialConsumption: consumption,
    processConstraints: constraints,
    yield: null,
    qualityState: "PENDING"
  };
}

export function updateProductionBatch(
  batch: Pm01ProductionBatch,
  finishedTonnes: number,
  feedConsumption: Pm01MaterialVector,
  timestamp: string
): Pm01ProductionBatch {
  const actualQuantityTonnes = batch.actualQuantityTonnes + finishedTonnes;
  const rawMaterialConsumption = addMaterial(batch.rawMaterialConsumption, feedConsumption);
  const inputTonnes = totalMaterialTonnes(rawMaterialConsumption);
  const completed = actualQuantityTonnes >= batch.plannedQuantityTonnes;
  return {
    ...batch,
    state: completed ? "COMPLETED" : "ACTIVE",
    actualQuantityTonnes,
    completedAt: completed ? timestamp : null,
    rawMaterialLots: batchLots(rawMaterialConsumption),
    rawMaterialConsumption,
    yield: inputTonnes === 0 ? null : actualQuantityTonnes / inputTonnes,
    qualityState: completed ? "PASS" : "PENDING"
  };
}
