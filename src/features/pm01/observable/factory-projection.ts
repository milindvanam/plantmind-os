import type { Pm01AssetDefinition } from "../contracts/asset";
import type { Pm01MaterialId, Pm01ProcessStageId } from "../contracts/material";
import type {
  Pm01AssetTagView,
  Pm01AssetView,
  Pm01DisplayStatus,
  Pm01FactoryView,
  Pm01ProcessNodeView
} from "../contracts/visualization";
import type { Pm01TagDefinition } from "../contracts/tag";
import { PM01_ASSETS } from "../plant-reality/asset-registry";
import type { Pm01FactoryState } from "../plant-reality/factory-model";
import { totalMaterialTonnes } from "../plant-reality/material-vector";
import { PM01_TAGS } from "../plant-reality/tag-registry";
import {
  getCurrentShift,
  getProductionDay,
  getSimulatedTimestamp
} from "../plant-reality/simulation-clock";

const AREA_NAMES = new Map(
  PM01_ASSETS.filter((asset) => asset.type === "area").map((asset) => [asset.id, asset.name])
);

const MATERIAL_CAPACITIES: Readonly<Record<Exclude<Pm01MaterialId, "ASC-100">, number>> = {
  "RM-A": 1_000,
  "RM-B": 500,
  "RM-C": 250,
  CATALYST: 30,
  "PROCESS-WATER": 250
};

const MATERIAL_LABELS: Readonly<Record<Exclude<Pm01MaterialId, "ASC-100">, string>> = {
  "RM-A": "Raw Material A",
  "RM-B": "Raw Material B",
  "RM-C": "Raw Material C",
  CATALYST: "Catalyst",
  "PROCESS-WATER": "Process Water"
};

const SIGNIFICANT_ASSETS = new Set([
  "TK-101",
  "TK-102",
  "TK-103",
  "MX-201",
  "V-201",
  "R-301",
  "HX-301",
  "CV-301",
  "P-301A",
  "P-301B",
  "SEP-401",
  "F-401",
  "HX-501",
  "DR-501",
  "TK-601",
  "TK-602",
  "PKG-701",
  "BLR-801",
  "CT-801",
  "CMP-801",
  "ELEC-801"
]);

function stageTonnes(state: Pm01FactoryState, stageId: Pm01ProcessStageId) {
  return totalMaterialTonnes(state.process.stages[stageId].material);
}

function ratePerHour(tonnes: number, state: Pm01FactoryState) {
  return (tonnes * 3_600) / (state.run.clock.stepMilliseconds / 1_000);
}

function valueForTag(tag: Pm01TagDefinition, state: Pm01FactoryState): number | string | boolean {
  const active = state.run.clock.status === "RUNNING";
  const rate = (tonnes: number) => ratePerHour(tonnes, state);
  const raw = state.process.stages["raw-material-storage"].material;
  const map: Record<string, number | string | boolean> = {
    TK101_LEVEL: (raw["RM-A"] / MATERIAL_CAPACITIES["RM-A"]) * 100,
    TK101_TEMP: 24.2,
    TK101_OUT_FLOW: rate(state.process.lastTick.feedPreparedMaterial["RM-A"]),
    TK102_LEVEL: (raw["RM-B"] / MATERIAL_CAPACITIES["RM-B"]) * 100,
    TK102_TEMP: 23.8,
    TK102_OUT_FLOW: rate(state.process.lastTick.feedPreparedMaterial["RM-B"]),
    TK102_DENSITY: 968,
    TK103_LEVEL: (raw["RM-C"] / MATERIAL_CAPACITIES["RM-C"]) * 100,
    TK103_TEMP: 24.5,
    TK103_OUT_FLOW: rate(state.process.lastTick.feedPreparedMaterial["RM-C"]),
    MX201_TEMP: active ? 34.8 : 24.5,
    MX201_LEVEL:
      (stageTonnes(state, "feed-preparation") /
        state.process.stages["feed-preparation"].capacityTonnes) *
      100,
    MX201_AGITATOR_RPM: active ? 420 : 0,
    MX201_MOTOR_POWER: active ? 18.4 : 0,
    MX201_BATCH_STATE: active ? "MIXING" : "HELD",
    R301_TEMP: active ? 126.4 : 42,
    R301_PRESS: active ? 4.6 : 1.1,
    R301_LEVEL:
      (stageTonnes(state, "reaction") / state.process.stages.reaction.capacityTonnes) * 100,
    R301_FEED_FLOW: rate(state.process.lastTick.feedPreparedTonnes),
    R301_PRODUCT_FLOW: rate(state.process.lastTick.reactorProductTonnes),
    R301_PH: 6.8,
    R301_REACTION_TIME: (state.process.elapsedSeconds % 21_600) / 60,
    R301_BATCH_PHASE: active ? "REACTION" : "HELD",
    R301_JACKET_IN_TEMP: active ? 31.5 : 28,
    R301_JACKET_OUT_TEMP: active ? 38.7 : 28,
    R301_TEMP_SP: 126.5,
    R301_TEMP_ERROR: active ? -0.1 : 0,
    HX301_PROCESS_IN_TEMP: active ? 126.4 : 42,
    HX301_PROCESS_OUT_TEMP: active ? 91.2 : 36,
    HX301_CW_IN_TEMP: 29.5,
    HX301_CW_OUT_TEMP: active ? 36.8 : 29.5,
    HX301_PROCESS_FLOW: rate(state.process.lastTick.reactorProductTonnes),
    HX301_CW_FLOW: active ? 145 : 0,
    HX301_DP_PROCESS: active ? 0.42 : 0,
    HX301_DP_CW: active ? 0.31 : 0,
    CV301_COMMAND: active ? 48 : 0,
    CV301_POSITION: active ? 47.7 : 0,
    CV301_TRAVEL: active ? 1.2 : 0,
    P301A_STATUS: active ? "RUNNING" : "IDLE",
    P301A_SUCTION_PRESS: active ? 2.1 : 1,
    P301A_DISCH_PRESS: active ? 5.4 : 1,
    P301A_FLOW: active ? 72 : 0,
    P301A_VIBRATION: active ? 2.1 : 0,
    P301A_BEARING_TEMP: active ? 58 : 28,
    P301A_MOTOR_CURRENT: active ? 38 : 0,
    P301A_MOTOR_POWER: active ? 21 : 0,
    P301A_SPEED: active ? 1_480 : 0,
    P301B_STATUS: "STANDBY",
    P301B_FLOW: 0,
    P301B_VIBRATION: 0,
    P301B_BEARING_TEMP: 28,
    P301B_MOTOR_POWER: 0,
    SEP401_LEVEL:
      (stageTonnes(state, "separation") / state.process.stages.separation.capacityTonnes) * 100,
    SEP401_PRESS: active ? 2.4 : 1,
    SEP401_FEED_FLOW: rate(state.process.lastTick.reactorProductTonnes),
    SEP401_PRODUCT_FLOW: rate(state.process.lastTick.separatedTonnes),
    F401_DP: active ? 0.36 : 0,
    F401_FLOW: rate(state.process.lastTick.separatedTonnes),
    F401_AGE: state.process.elapsedSeconds / 3_600,
    DR501_IN_TEMP: active ? 82 : 27,
    DR501_OUT_TEMP: active ? 58 : 27,
    DR501_POWER: active ? 44 : 0,
    DR501_THROUGHPUT: rate(state.process.lastTick.finishedTonnes),
    PKG701_STATUS: active ? "RUNNING" : "IDLE",
    PKG701_RATE: rate(state.process.lastTick.packagedTonnes),
    PKG701_SPEED: active ? 12 : 0,
    PKG701_STOP_COUNT: 0,
    PKG701_MICROSTOP_DURATION: 0,
    PKG701_REJECT_COUNT: 0,
    CT801_CW_SUPPLY_TEMP: 29.5,
    CT801_CW_RETURN_TEMP: active ? 36.8 : 29.5,
    CT801_AMBIENT_TEMP: 31,
    CT801_FAN_SPEED: active ? 720 : 180,
    CT801_FAN_POWER: active ? 32 : 6,
    BLR801_STEAM_PRESS: active ? 8.2 : 2,
    BLR801_STEAM_FLOW: rate(state.process.lastTick.reactorProductTonnes) * 0.25,
    BLR801_FUEL_FLOW: active ? 310 : 45,
    BLR801_EFFICIENCY: active ? 88.4 : 72,
    CMP801_PRESS: active ? 6.8 : 5.5,
    CMP801_FLOW: rate(state.process.lastTick.packagedTonnes) * 100,
    CMP801_POWER: active ? 52 : 11,
    CMP801_LOAD: active ? 74 : 18
  };
  return map[tag.id] ?? "Unavailable";
}

function outside(value: number, range: { minimum: number; maximum: number }) {
  return value < range.minimum || value > range.maximum;
}

function tagStatus(tag: Pm01TagDefinition, value: number | string | boolean): Pm01DisplayStatus {
  if (typeof value !== "number") return "NORMAL";
  if (tag.alarmRange && outside(value, tag.alarmRange)) return "CRITICAL";
  if (tag.warningRange && outside(value, tag.warningRange)) return "WARNING";
  if (tag.normalRange && outside(value, tag.normalRange)) return "WARNING";
  return "NORMAL";
}

function assetView(asset: Pm01AssetDefinition, state: Pm01FactoryState): Pm01AssetView {
  const tags: Pm01AssetTagView[] = PM01_TAGS.filter((tag) => tag.assetId === asset.id).map(
    (tag) => {
      const value = valueForTag(tag, state);
      return {
        id: tag.id,
        name: tag.name,
        value,
        engineeringUnit: tag.engineeringUnit,
        quality: "GOOD",
        normalRange: tag.normalRange,
        warningRange: tag.warningRange,
        alarmRange: tag.alarmRange
      };
    }
  );
  const statuses = tags.map((tag) => {
    const definition = PM01_TAGS.find((candidate) => candidate.id === tag.id);
    return definition ? tagStatus(definition, tag.value) : "NORMAL";
  });
  const status: Pm01DisplayStatus = statuses.includes("CRITICAL")
    ? "CRITICAL"
    : statuses.includes("WARNING")
      ? "WARNING"
      : "NORMAL";
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    areaCode: asset.areaCode,
    areaName: asset.areaCode ? (AREA_NAMES.get(asset.areaCode) ?? asset.areaCode) : "Site",
    operationalState: state.run.clock.status === "RUNNING" ? "RUNNING" : "IDLE",
    status,
    ratedCapacity: asset.ratedCapacity,
    designParameters: asset.designParameters,
    tags
  };
}

function processNodes(state: Pm01FactoryState): readonly Pm01ProcessNodeView[] {
  const active = state.run.clock.status === "RUNNING";
  const node = (
    id: string,
    title: string,
    subtitle: string,
    assetIds: readonly string[],
    stages: readonly Pm01ProcessStageId[],
    tickTonnes: number
  ): Pm01ProcessNodeView => ({
    id,
    title,
    subtitle,
    assetIds,
    inventoryTonnes: stages.reduce((sum, stageId) => sum + stageTonnes(state, stageId), 0),
    throughputTonnesPerHour: ratePerHour(tickTonnes, state),
    active: active && tickTonnes > 0,
    status: "NORMAL"
  });
  return [
    node(
      "receiving",
      "Receiving",
      "Inbound raw materials",
      ["TK-101", "TK-102", "TK-103"],
      ["receiving"],
      state.process.lastTick.feedPreparedTonnes
    ),
    node(
      "tank-farm",
      "Tank farm",
      "TK-101 · TK-102 · TK-103",
      ["TK-101", "TK-102", "TK-103"],
      ["raw-material-storage"],
      state.process.lastTick.feedPreparedTonnes
    ),
    node(
      "feed",
      "Feed preparation",
      "MX-201 · V-201",
      ["MX-201", "V-201"],
      ["feed-preparation"],
      state.process.lastTick.feedPreparedTonnes
    ),
    node(
      "reaction",
      "Reaction",
      "R-301 thermal loop",
      ["R-301", "HX-301", "CV-301", "P-301A", "P-301B"],
      ["reaction"],
      state.process.lastTick.reactorProductTonnes
    ),
    node(
      "separation",
      "Separation",
      "SEP-401 · F-401",
      ["SEP-401", "F-401"],
      ["separation"],
      state.process.lastTick.separatedTonnes
    ),
    node(
      "finishing",
      "Finishing",
      "HX-501 · DR-501",
      ["HX-501", "DR-501"],
      ["finishing"],
      state.process.lastTick.finishedTonnes
    ),
    node(
      "quality",
      "Quality release",
      "TK-601 → TK-602",
      ["TK-601", "TK-602"],
      ["intermediate-storage", "released-product-storage"],
      state.process.lastTick.finishedTonnes
    ),
    node(
      "packaging",
      "Packaging",
      "PKG-701",
      ["PKG-701"],
      ["packaging"],
      state.process.lastTick.packagedTonnes
    ),
    node(
      "finished-goods",
      "Finished goods",
      "Warehouse inventory",
      ["PKG-701"],
      ["finished-goods-storage"],
      state.process.lastTick.packagedTonnes
    ),
    node(
      "dispatch",
      "Dispatch",
      "Outbound logistics",
      [],
      [],
      state.process.lastTick.dispatchedTonnes
    )
  ];
}

export function projectFactoryView(state: Pm01FactoryState): Pm01FactoryView {
  const timestamp = getSimulatedTimestamp(state.run.clock);
  const expectedByNowTonnes =
    state.production.currentDayActualTonnes - state.production.productionVarianceTonnes;
  const raw = state.process.stages["raw-material-storage"].material;
  const receiving = state.process.stages.receiving.material;
  const materialIds = ["RM-A", "RM-B", "RM-C", "CATALYST", "PROCESS-WATER"] as const;
  return {
    run: {
      status: state.run.clock.status,
      speed: state.run.clock.speed,
      timestamp,
      shift: getCurrentShift(state.run.clock),
      productionDay: getProductionDay(state.run.clock)
    },
    kpis: {
      productionTodayTonnes: state.production.currentDayActualTonnes,
      dailyTargetTonnes: state.production.dailyTargetTonnes,
      expectedByNowTonnes,
      targetAchievement: state.production.targetAchievement,
      productionVarianceTonnes: state.production.productionVarianceTonnes,
      projectedEndOfDayTonnes: state.production.projectedEndOfDayTonnes,
      productionRateTonnesPerDay: state.production.currentProductionRateTonnesPerDay,
      capacityUtilization: state.production.capacityUtilization,
      oee: state.production.oee,
      energyPerTonne: state.energy.energyPerTonne
    },
    inventories: materialIds.map((materialId) => {
      const tonnes = raw[materialId] + receiving[materialId];
      return {
        materialId,
        label: MATERIAL_LABELS[materialId],
        tonnes,
        capacityTonnes: MATERIAL_CAPACITIES[materialId],
        utilization: tonnes / MATERIAL_CAPACITIES[materialId]
      };
    }),
    processNodes: processNodes(state),
    utilities: [
      {
        id: "electricity",
        label: "Electricity",
        value: state.energy.electricityKwh,
        unit: "kWh",
        assetId: "ELEC-801"
      },
      {
        id: "steam",
        label: "Steam",
        value: state.energy.steamTonnes,
        unit: "T",
        assetId: "BLR-801"
      },
      {
        id: "cooling",
        label: "Cooling",
        value: state.energy.coolingKwhEquivalent,
        unit: "kWh-eq",
        assetId: "CT-801"
      },
      {
        id: "compressed-air",
        label: "Compressed air",
        value: state.energy.compressedAirNm3,
        unit: "Nm³",
        assetId: "CMP-801"
      }
    ],
    batches: state.batches
      .slice(-4)
      .reverse()
      .map((batch) => ({
        id: batch.id,
        state: batch.state,
        product: batch.product,
        plannedQuantityTonnes: batch.plannedQuantityTonnes,
        actualQuantityTonnes: batch.actualQuantityTonnes,
        startedAt: batch.startedAt,
        expectedCompletionAt: batch.expectedCompletionAt,
        completedAt: batch.completedAt,
        rawMaterialLots: batch.rawMaterialLots,
        yield: batch.yield,
        qualityState: batch.qualityState
      })),
    assets: PM01_ASSETS.filter((asset) => SIGNIFICANT_ASSETS.has(asset.id)).map((asset) =>
      assetView(asset, state)
    )
  };
}
