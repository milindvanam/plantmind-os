import {
  PM01_MATERIAL_IDS,
  type Pm01MaterialId,
  type Pm01MaterialVector
} from "../contracts/material";

export function emptyMaterialVector(): Pm01MaterialVector {
  return {
    "RM-A": 0,
    "RM-B": 0,
    "RM-C": 0,
    CATALYST: 0,
    "PROCESS-WATER": 0,
    "ASC-100": 0
  };
}

export function materialVector(
  values: Partial<Record<Pm01MaterialId, number>> = {}
): Pm01MaterialVector {
  const vector = { ...emptyMaterialVector(), ...values };
  for (const materialId of PM01_MATERIAL_IDS) {
    const value = vector[materialId];
    if (!Number.isFinite(value) || value < 0)
      throw new Error(`Invalid PM-01 material quantity for ${materialId}`);
  }
  return vector;
}

export function totalMaterialTonnes(vector: Pm01MaterialVector) {
  return PM01_MATERIAL_IDS.reduce((total, materialId) => total + vector[materialId], 0);
}

export function addMaterial(
  left: Pm01MaterialVector,
  right: Pm01MaterialVector
): Pm01MaterialVector {
  return materialVector(
    Object.fromEntries(
      PM01_MATERIAL_IDS.map((materialId) => [materialId, left[materialId] + right[materialId]])
    )
  );
}

export function subtractMaterial(
  left: Pm01MaterialVector,
  right: Pm01MaterialVector
): Pm01MaterialVector {
  const result = Object.fromEntries(
    PM01_MATERIAL_IDS.map((materialId) => [materialId, left[materialId] - right[materialId]])
  ) as Record<Pm01MaterialId, number>;
  for (const materialId of PM01_MATERIAL_IDS) {
    if (result[materialId] < -1e-10)
      throw new Error(`PM-01 material transfer exceeds available ${materialId}`);
    result[materialId] = Math.max(0, result[materialId]);
  }
  return materialVector(result);
}

export function scaleMaterial(vector: Pm01MaterialVector, factor: number): Pm01MaterialVector {
  if (!Number.isFinite(factor) || factor < 0) throw new Error("Invalid PM-01 material scale");
  return materialVector(
    Object.fromEntries(
      PM01_MATERIAL_IDS.map((materialId) => [materialId, vector[materialId] * factor])
    )
  );
}
