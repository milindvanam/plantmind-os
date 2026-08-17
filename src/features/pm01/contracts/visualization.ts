import type { Pm01AreaCode, Pm01AssetType, Pm01OperationalState } from "./asset";
import type { Pm01BatchQualityState, Pm01BatchState, Pm01Oee } from "./production";
import type { Pm01SimulationSpeed, Pm01RunStatus } from "./simulation";
import type { Pm01OperatingBand, Pm01TagQuality } from "./tag";

export type Pm01DisplayStatus = "NORMAL" | "WARNING" | "CRITICAL" | "OFFLINE";

export type Pm01FactoryKpisView = Readonly<{
  productionTodayTonnes: number;
  dailyTargetTonnes: number;
  expectedByNowTonnes: number;
  targetAchievement: number;
  productionVarianceTonnes: number;
  projectedEndOfDayTonnes: number | null;
  productionRateTonnesPerDay: number;
  capacityUtilization: number;
  oee: Pm01Oee;
  energyPerTonne: number | null;
}>;

export type Pm01InventoryView = Readonly<{
  materialId: "RM-A" | "RM-B" | "RM-C" | "CATALYST" | "PROCESS-WATER";
  label: string;
  tonnes: number;
  capacityTonnes: number;
  utilization: number;
}>;

export type Pm01ProcessNodeView = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  assetIds: readonly string[];
  inventoryTonnes: number;
  throughputTonnesPerHour: number;
  active: boolean;
  status: Pm01DisplayStatus;
}>;

export type Pm01UtilityView = Readonly<{
  id: "electricity" | "steam" | "cooling" | "compressed-air";
  label: string;
  value: number;
  unit: string;
  assetId: string;
}>;

export type Pm01BatchView = Readonly<{
  id: string;
  state: Pm01BatchState;
  product: "ASC-100";
  plannedQuantityTonnes: number;
  actualQuantityTonnes: number;
  startedAt: string;
  expectedCompletionAt: string;
  completedAt: string | null;
  rawMaterialLots: readonly Readonly<{
    materialId: string;
    lotId: string;
    consumedTonnes: number;
  }>[];
  yield: number | null;
  qualityState: Pm01BatchQualityState;
}>;

export type Pm01AssetTagView = Readonly<{
  id: string;
  name: string;
  value: number | string | boolean;
  engineeringUnit: string;
  quality: Pm01TagQuality;
  normalRange: Pm01OperatingBand | null;
  warningRange: Pm01OperatingBand | null;
  alarmRange: Pm01OperatingBand | null;
}>;

export type Pm01AssetView = Readonly<{
  id: string;
  name: string;
  type: Pm01AssetType;
  areaCode: Pm01AreaCode | null;
  areaName: string;
  operationalState: Pm01OperationalState;
  status: Pm01DisplayStatus;
  ratedCapacity: Readonly<{ value: number; unit: string }> | null;
  designParameters: Readonly<Record<string, string | number | boolean>>;
  tags: readonly Pm01AssetTagView[];
}>;

export type Pm01FactoryView = Readonly<{
  run: Readonly<{
    status: Pm01RunStatus;
    speed: Pm01SimulationSpeed;
    timestamp: string;
    shift: "A" | "B" | "C";
    productionDay: number;
  }>;
  kpis: Pm01FactoryKpisView;
  inventories: readonly Pm01InventoryView[];
  processNodes: readonly Pm01ProcessNodeView[];
  utilities: readonly Pm01UtilityView[];
  batches: readonly Pm01BatchView[];
  assets: readonly Pm01AssetView[];
}>;
