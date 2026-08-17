import type { Pm01EnergyConfiguration, Pm01EnergyHistoryPoint } from "../contracts/energy";
import type { Pm01ProcessConstraints, Pm01ProcessState } from "../contracts/material";
import type {
  Pm01FactoryCommand,
  Pm01ProductionBatch,
  Pm01ProductionConfiguration,
  Pm01ProductionHistoryPoint,
  Pm01ProductionMetrics
} from "../contracts/production";
import type { Pm01RunConfiguration, Pm01SimulationRun } from "../contracts/simulation";
import {
  accumulateEnergy,
  createEnergyState,
  PM01_HEALTHY_ENERGY_CONFIGURATION
} from "./energy-model";
import {
  advanceProcessState,
  createInitialProcessState,
  PM01_HEALTHY_PROCESS_CONSTRAINTS
} from "./process-model";
import {
  accumulateProduction,
  calculateProductionMetrics,
  createProductionAccumulator,
  createProductionBatch,
  PM01_PRODUCTION_CONFIGURATION,
  type Pm01ProductionAccumulator,
  updateProductionBatch
} from "./production-model";
import {
  advanceRunByRealMilliseconds,
  advanceRunByTicks,
  applyRunCommand,
  createSimulationRun
} from "./run-lifecycle";
import { getSimulatedTimestamp } from "./simulation-clock";

export type Pm01FactoryState = Readonly<{
  run: Pm01SimulationRun;
  process: Pm01ProcessState;
  initialProcess: Pm01ProcessState;
  processConstraints: Pm01ProcessConstraints;
  productionConfiguration: Pm01ProductionConfiguration;
  energyConfiguration: Pm01EnergyConfiguration;
  productionAccumulator: Pm01ProductionAccumulator;
  production: Pm01ProductionMetrics;
  energy: ReturnType<typeof createEnergyState>;
  batches: readonly Pm01ProductionBatch[];
  productionHistory: readonly Pm01ProductionHistoryPoint[];
  energyHistory: readonly Pm01EnergyHistoryPoint[];
  nextBatchSequence: number;
  lastHistorySampleSeconds: number;
}>;

export type Pm01FactoryOptions = Readonly<{
  initialProcess?: Pm01ProcessState;
  processConstraints?: Pm01ProcessConstraints;
  productionConfiguration?: Pm01ProductionConfiguration;
  energyConfiguration?: Pm01EnergyConfiguration;
}>;

function initialProduction(configuration: Pm01ProductionConfiguration) {
  return calculateProductionMetrics(createProductionAccumulator(), 0, 0, 0, configuration);
}

export function createFactoryState(
  runId: string,
  runConfiguration: Pm01RunConfiguration,
  options: Pm01FactoryOptions = {}
): Pm01FactoryState {
  const run = createSimulationRun(runId, runConfiguration);
  const initialProcess = options.initialProcess ?? createInitialProcessState();
  const processConstraints = options.processConstraints ?? PM01_HEALTHY_PROCESS_CONSTRAINTS;
  const productionConfiguration = options.productionConfiguration ?? PM01_PRODUCTION_CONFIGURATION;
  const energyConfiguration = options.energyConfiguration ?? PM01_HEALTHY_ENERGY_CONFIGURATION;
  return {
    run,
    process: initialProcess,
    initialProcess,
    processConstraints,
    productionConfiguration,
    energyConfiguration,
    productionAccumulator: createProductionAccumulator(),
    production: initialProduction(productionConfiguration),
    energy: createEnergyState(),
    batches: [
      createProductionBatch(
        runId,
        1,
        getSimulatedTimestamp(run.clock),
        processConstraints,
        productionConfiguration
      )
    ],
    productionHistory: [],
    energyHistory: [],
    nextBatchSequence: 2,
    lastHistorySampleSeconds: 0
  };
}

function advanceFactoryOneTick(state: Pm01FactoryState): Pm01FactoryState {
  const run = advanceRunByTicks(state.run, 1);
  if (run === state.run) return state;
  const stepSeconds = state.run.clock.stepMilliseconds / 1000;
  const process = advanceProcessState(state.process, stepSeconds, state.processConstraints);
  const timestamp = getSimulatedTimestamp(run.clock);
  const productionAccumulator = accumulateProduction(
    state.productionAccumulator,
    state.process.elapsedSeconds,
    stepSeconds,
    process.lastTick.finishedTonnes,
    process.lastTick.finishingLossTonnes,
    process.lastTick.reactorProductTonnes
  );
  const production = calculateProductionMetrics(
    productionAccumulator,
    process.elapsedSeconds,
    process.lastTick.finishedTonnes,
    stepSeconds,
    state.productionConfiguration
  );
  const energy = accumulateEnergy(
    state.energy,
    stepSeconds,
    process.lastTick.reactorProductTonnes,
    process.lastTick.finishedTonnes,
    process.lastTick.packagedTonnes,
    production.cumulativeActualTonnes,
    state.energyConfiguration
  );

  let batches = state.batches;
  let nextBatchSequence = state.nextBatchSequence;
  let activeBatch = batches.at(-1);
  if (!activeBatch || activeBatch.state === "COMPLETED") {
    activeBatch = createProductionBatch(
      state.run.id,
      nextBatchSequence,
      getSimulatedTimestamp(state.run.clock),
      state.processConstraints,
      state.productionConfiguration
    );
    batches = [...batches, activeBatch];
    nextBatchSequence += 1;
  }
  const updatedBatch = updateProductionBatch(
    activeBatch,
    process.lastTick.finishedTonnes,
    process.lastTick.feedPreparedMaterial,
    timestamp
  );
  batches = [...batches.slice(0, -1), updatedBatch];

  const historyInterval = Math.max(
    state.productionConfiguration.historySampleSeconds,
    state.energyConfiguration.historySampleSeconds
  );
  const shouldSample =
    process.elapsedSeconds - state.lastHistorySampleSeconds >= historyInterval ||
    run.clock.status === "COMPLETED";
  return {
    ...state,
    run,
    process,
    productionAccumulator,
    production,
    energy,
    batches,
    productionHistory: shouldSample
      ? [
          ...state.productionHistory,
          {
            timestamp,
            dailyActualTonnes: production.currentDayActualTonnes,
            shiftActualTonnes: production.currentShiftActualTonnes,
            productionRateTonnesPerDay: production.currentProductionRateTonnesPerDay,
            targetAchievement: production.targetAchievement,
            oee: production.oee.oee
          }
        ]
      : state.productionHistory,
    energyHistory: shouldSample
      ? [
          ...state.energyHistory,
          {
            timestamp,
            electricityKwh: energy.electricityKwh,
            steamTonnes: energy.steamTonnes,
            coolingKwhEquivalent: energy.coolingKwhEquivalent,
            compressedAirNm3: energy.compressedAirNm3,
            totalEnergyKwhEquivalent: energy.totalEnergyKwhEquivalent,
            energyPerTonne: energy.energyPerTonne
          }
        ]
      : state.energyHistory,
    nextBatchSequence,
    lastHistorySampleSeconds: shouldSample ? process.elapsedSeconds : state.lastHistorySampleSeconds
  };
}

export function advanceFactoryByTicks(state: Pm01FactoryState, ticks: number) {
  if (!Number.isInteger(ticks) || ticks < 0)
    throw new Error("PM-01 factory ticks must be non-negative");
  let next = state;
  for (let tick = 0; tick < ticks; tick += 1) next = advanceFactoryOneTick(next);
  return next;
}

export function advanceFactoryByRealMilliseconds(
  state: Pm01FactoryState,
  elapsedRealMilliseconds: number
) {
  const targetRun = advanceRunByRealMilliseconds(state.run, elapsedRealMilliseconds);
  if (targetRun === state.run) return state;
  const ticks = targetRun.clock.tick - state.run.clock.tick;
  const advanced = advanceFactoryByTicks(state, ticks);
  return {
    ...advanced,
    run: targetRun
  } satisfies Pm01FactoryState;
}

export function applyFactoryCommand(state: Pm01FactoryState, command: Pm01FactoryCommand) {
  if (command.type === "RESET")
    return createFactoryState(state.run.id, state.run.configuration, {
      initialProcess: state.initialProcess,
      processConstraints: state.processConstraints,
      productionConfiguration: state.productionConfiguration,
      energyConfiguration: state.energyConfiguration
    });
  return { ...state, run: applyRunCommand(state.run, command) } satisfies Pm01FactoryState;
}
