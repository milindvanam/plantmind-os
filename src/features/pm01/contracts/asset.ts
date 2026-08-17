export type Pm01AreaCode =
  | "AREA-100"
  | "AREA-200"
  | "AREA-300"
  | "AREA-400"
  | "AREA-500"
  | "AREA-600"
  | "AREA-700"
  | "AREA-800";

export type Pm01AssetType =
  | "site"
  | "area"
  | "tank"
  | "pump"
  | "mixer"
  | "vessel"
  | "reactor"
  | "agitator"
  | "heat-exchanger"
  | "control-valve"
  | "separator"
  | "filter"
  | "dryer"
  | "packaging-line"
  | "boiler"
  | "cooling-tower"
  | "compressor"
  | "electrical-distribution";

export type Pm01OperationalState = "OFFLINE" | "IDLE" | "STARTING" | "RUNNING" | "STOPPING";
export type Pm01MaintenanceState = "AVAILABLE" | "PLANNED" | "IN_MAINTENANCE" | "UNAVAILABLE";

export type Pm01AssetDefinition = Readonly<{
  id: string;
  name: string;
  type: Pm01AssetType;
  parentId: string | null;
  areaCode: Pm01AreaCode | null;
  ratedCapacity: Readonly<{ value: number; unit: string }> | null;
  designParameters: Readonly<Record<string, string | number | boolean>>;
}>;

export type Pm01AssetState = Readonly<{
  assetId: string;
  operationalState: Pm01OperationalState;
  maintenanceState: Pm01MaintenanceState;
}>;
