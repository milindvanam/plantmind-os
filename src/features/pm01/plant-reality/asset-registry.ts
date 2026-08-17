import type { Pm01AreaCode, Pm01AssetDefinition } from "../contracts/asset";

const site: Pm01AssetDefinition = {
  id: "PM-01",
  name: "PM-01 Manufacturing Plant",
  type: "site",
  parentId: null,
  areaCode: null,
  ratedCapacity: { value: 100, unit: "t/day" },
  designParameters: { product: "ASC-100", operatingModel: "continuous-batch-hybrid" }
};

const area = (code: Pm01AreaCode, name: string): Pm01AssetDefinition => ({
  id: code,
  name,
  type: "area",
  parentId: site.id,
  areaCode: code,
  ratedCapacity: null,
  designParameters: {}
});

const equipment = (
  id: string,
  name: string,
  type: Pm01AssetDefinition["type"],
  areaCode: Pm01AreaCode,
  options: Partial<Pick<Pm01AssetDefinition, "ratedCapacity" | "designParameters">> = {}
): Pm01AssetDefinition => ({
  id,
  name,
  type,
  parentId: areaCode,
  areaCode,
  ratedCapacity: options.ratedCapacity ?? null,
  designParameters: options.designParameters ?? {}
});

export const PM01_ASSETS: readonly Pm01AssetDefinition[] = [
  site,
  area("AREA-100", "Raw Material Storage"),
  area("AREA-200", "Feed Preparation"),
  area("AREA-300", "Reaction"),
  area("AREA-400", "Separation"),
  area("AREA-500", "Finishing"),
  area("AREA-600", "Product Storage"),
  area("AREA-700", "Packaging"),
  area("AREA-800", "Utilities"),
  equipment("TK-101", "Raw Material A Tank", "tank", "AREA-100"),
  equipment("TK-102", "Raw Material B Tank", "tank", "AREA-100"),
  equipment("TK-103", "Raw Material C Tank", "tank", "AREA-100"),
  equipment("P-101A", "Raw Material Transfer Pump A", "pump", "AREA-100"),
  equipment("P-101B", "Raw Material Transfer Pump B", "pump", "AREA-100"),
  equipment("MX-201", "Feed Mixer", "mixer", "AREA-200"),
  equipment("V-201", "Feed Vessel", "vessel", "AREA-200"),
  equipment("P-201", "Feed Pump", "pump", "AREA-200"),
  equipment("R-301", "Main Reactor", "reactor", "AREA-300"),
  equipment("AG-301", "Reactor Agitator", "agitator", "AREA-300"),
  equipment("HX-301", "Reactor Heat Exchanger", "heat-exchanger", "AREA-300"),
  equipment("P-301A", "Circulation Pump A", "pump", "AREA-300"),
  equipment("P-301B", "Circulation Pump B", "pump", "AREA-300"),
  equipment("CV-301", "Cooling Control Valve", "control-valve", "AREA-300"),
  equipment("SEP-401", "Separator", "separator", "AREA-400"),
  equipment("F-401", "Process Filter", "filter", "AREA-400"),
  equipment("P-401", "Separation Transfer Pump", "pump", "AREA-400"),
  equipment("HX-501", "Product Cooler", "heat-exchanger", "AREA-500"),
  equipment("DR-501", "Product Dryer", "dryer", "AREA-500"),
  equipment("P-501", "Product Pump", "pump", "AREA-500"),
  equipment("TK-601", "Intermediate Product Tank", "tank", "AREA-600"),
  equipment("TK-602", "Released Product Tank", "tank", "AREA-600"),
  equipment("PKG-701", "Packaging Line", "packaging-line", "AREA-700", {
    ratedCapacity: { value: 5, unit: "t/hour" },
    designParameters: { stations: "filling,weighing,conveyor,palletization" }
  }),
  equipment("BLR-801", "Boiler", "boiler", "AREA-800"),
  equipment("CT-801", "Cooling Tower", "cooling-tower", "AREA-800"),
  equipment("P-801A", "Cooling Water Pump A", "pump", "AREA-800"),
  equipment("P-801B", "Cooling Water Pump B", "pump", "AREA-800"),
  equipment("CMP-801", "Air Compressor", "compressor", "AREA-800"),
  equipment("ELEC-801", "Electrical Distribution", "electrical-distribution", "AREA-800")
] as const;

export function validateAssetRegistry(assets: readonly Pm01AssetDefinition[] = PM01_ASSETS) {
  const ids = new Set<string>();
  for (const asset of assets) {
    if (ids.has(asset.id)) throw new Error(`Duplicate PM-01 asset ID: ${asset.id}`);
    ids.add(asset.id);
  }
  for (const asset of assets) {
    if (asset.parentId !== null && !ids.has(asset.parentId))
      throw new Error(`PM-01 asset ${asset.id} has unknown parent ${asset.parentId}`);
    if (asset.type !== "site" && asset.areaCode === null)
      throw new Error(`PM-01 asset ${asset.id} is missing an area`);
  }
  return { assetCount: assets.length, ids } as const;
}

export function getPm01Asset(assetId: string) {
  return PM01_ASSETS.find((asset) => asset.id === assetId) ?? null;
}
